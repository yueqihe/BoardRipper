"""Merge upstream into a review branch; never overwrite the Chinese default branch."""

import json
import os
from pathlib import Path
import subprocess
import urllib.parse
import urllib.request

UPSTREAM = 'https://github.com/AlexeyInwerp/BoardRipper.git'
SYNC_BRANCH = 'sync/upstream'
CONFLICT_TITLE = '上游同步需要处理合并冲突'


def git(*args, cwd=None, check=True):
    return subprocess.run(['git', *args], cwd=cwd, check=check, text=True,
                          encoding='utf-8', stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def ancestor(older, newer, cwd=None):
    result = git('merge-base', '--is-ancestor', older, newer, cwd=cwd, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError(result.stderr)
    return result.returncode == 0


def prepare_sync(base, upstream, existing=None, cwd=None):
    """Local-only operation, also exercised with real divergent Git histories in tests."""
    if git('status', '--porcelain', cwd=cwd).stdout:
        raise RuntimeError('同步需要干净工作区。')
    if ancestor(upstream, base, cwd):
        return {'status': 'current'}
    # Reuse a pending PR's history. If it was already merged, start at current main.
    start = existing if existing and not ancestor(existing, base, cwd) else base
    git('checkout', '-B', SYNC_BRANCH, start, cwd=cwd)
    before = git('rev-parse', 'HEAD', cwd=cwd).stdout.strip()
    for target in (base, upstream):
        result = git('merge', '--no-edit', target, cwd=cwd, check=False)
        if result.returncode:
            files = git('diff', '--name-only', '--diff-filter=U', cwd=cwd).stdout.splitlines()
            git('merge', '--abort', cwd=cwd, check=False)
            if not files:
                raise RuntimeError(result.stderr)
            return {'status': 'conflict', 'files': files}
    head = git('rev-parse', 'HEAD', cwd=cwd).stdout.strip()
    return {'status': 'ready', 'sha': head, 'changed': before != head}


class GitHub:
    def __init__(self):
        self.repo = os.environ['GITHUB_REPOSITORY']
        self.token = os.environ['GH_TOKEN']

    def request(self, path, method='GET', data=None):
        request = urllib.request.Request(
            f'https://api.github.com/repos/{self.repo}/{path}', method=method,
            data=json.dumps(data, ensure_ascii=False).encode() if data is not None else None,
            headers={'Authorization': f'Bearer {self.token}', 'Accept': 'application/vnd.github+json',
                     'Content-Type': 'application/json', 'User-Agent': 'BoardRipper-upstream-sync'})
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read()
            return json.loads(body) if body else None

    def conflict_issue(self, body=None):
        # Search is eventually consistent; paginate the actual open-issues endpoint instead.
        page = 1
        while True:
            issues = self.request(f'issues?state=open&per_page=100&page={page}')
            for issue in issues:
                if 'pull_request' not in issue and issue['title'] == CONFLICT_TITLE:
                    if body is None:
                        return self.request(f"issues/{issue['number']}", 'PATCH', {'state': 'closed'})
                    return self.request(f"issues/{issue['number']}", 'PATCH', {'body': body})
            if len(issues) < 100:
                break
            page += 1
        if body is not None:
            return self.request('issues', 'POST', {'title': CONFLICT_TITLE, 'body': body})


def main():
    api = GitHub()
    base_branch = api.request('')['default_branch']
    # Fetch only the two maintained branch names; no tags or arbitrary fork refs.
    git('config', 'user.name', 'github-actions[bot]')
    git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    git('fetch', '--no-tags', 'origin', f'{base_branch}:refs/remotes/origin/{base_branch}')
    git('fetch', '--no-tags', UPSTREAM, 'main:refs/remotes/upstream/main')
    existing = None
    if git('ls-remote', '--heads', 'origin', SYNC_BRANCH).stdout.strip():
        git('fetch', '--no-tags', 'origin', f'{SYNC_BRANCH}:refs/remotes/origin/{SYNC_BRANCH}')
        existing = f'origin/{SYNC_BRANCH}'
    result = prepare_sync(f'origin/{base_branch}', 'upstream/main', existing)
    run_url = f"https://github.com/{api.repo}/actions/runs/{os.environ['GITHUB_RUN_ID']}"
    if result['status'] == 'conflict':
        body = '自动合并遇到冲突，未将本次结果推送到远端。中文版默认分支保持原样。\n\n'
        body += '\n'.join(f'- `{name}`' for name in result['files'])
        body += (f'\n\n[运行日志]({run_url}) · [手动处理说明]'
                 f'(https://github.com/{api.repo}/blob/{base_branch}/docs/UPSTREAM_SYNC.zh-CN.md)')
        api.conflict_issue(body)
        raise RuntimeError('上游合并有冲突，已更新提示 Issue。')
    api.conflict_issue()
    if result['status'] == 'current':
        print('中文版已包含最新上游提交，无需同步。')
        return
    # Plain push deliberately rejects concurrent/divergent branch changes.
    git('push', 'origin', f'HEAD:refs/heads/{SYNC_BRANCH}')
    upstream_sha = git('rev-parse', 'upstream/main').stdout.strip()
    base_sha = git('rev-parse', f'origin/{base_branch}').stdout.strip()
    owner = api.repo.split('/')[0]
    query = urllib.parse.urlencode({'state': 'open', 'head': f'{owner}:{SYNC_BRANCH}', 'base': base_branch})
    prs = api.request(f'pulls?{query}')
    body = (f'将原项目 `main` 合并到中文版，保留双方提交历史。\n\n'
            f'- 上游提交：`{upstream_sha}`\n- 中文版基线：`{base_sha}`\n'
            f'- 同步提交：`{result["sha"]}`\n\n'
            '请检查 CI、功能变化及新增界面文案，补齐翻译后再合并。此 PR 不会自动批准或合并。\n\n'
            f'[本次同步日志]({run_url})')
    payload = {'title': '同步 BoardRipper 上游更新', 'body': body}
    if prs:
        pr = api.request(f"pulls/{prs[0]['number']}", 'PATCH', payload)
    else:
        pr = api.request('pulls', 'POST', {**payload, 'head': SYNC_BRANCH, 'base': base_branch})
    print(f'待审核 PR：{pr["html_url"]}')
    # A dispatch DOES start CI even when the branch/PR was created by GITHUB_TOKEN.
    # Always dispatch: also recovers a previous run interrupted after pushing the branch.
    api.request('actions/workflows/ci.yml/dispatches', 'POST', {'ref': SYNC_BRANCH})
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with Path(summary).open('a', encoding='utf-8') as file:
            file.write(f'已生成[同步 PR]({pr["html_url"]})，并触发中文构建与 CI。\n')


if __name__ == '__main__':
    main()
