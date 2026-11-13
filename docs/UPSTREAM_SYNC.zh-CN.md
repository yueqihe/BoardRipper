# 上游同步与汉化维护

中文版默认分支为 `main`，上游为 `AlexeyInwerp/BoardRipper` 的 `main`。通过普通 Git 合并保留双方历史，不使用强制同步覆盖中文分支。

## 自动同步怎样运行

1. 每天北京时间 10:00 检查，也可手动运行“同步上游”。
2. 没有新提交时结束；有更新时，在 `sync/upstream` 合并中文 `main` 和上游 `main`。
3. 无冲突时推送同步分支，创建或更新同一个 PR，并手动触发该分支的 CI，避免 `GITHUB_TOKEN` 创建的 PR 不会自动触发其他工作流的限制。
4. CI 运行上游检查及中文单元测试、离线构建和中文浏览器测试，提供含 HTML、说明、许可证与对应源码的构建附件。
5. 人工检查新增文案与功能后合并 PR。工作流不会自动合并、发布 Release 或更新本机程序。
6. 有合并冲突时中止合并，不推送冲突结果，创建或更新提示 Issue。已打开的 PR 可能停留在上一次成功合并的状态，请同时看最新工作流结果。

分支推送不使用强制覆盖。重复运行不会反复创建相同 PR 或 Issue。CI 失败时查看日志并修复后再合并。定时执行可能延迟，长期无活动也可能被 GitHub 暂停。

## 仓库设置

- Actions 需启用，默认分支需包含 `.github/workflows/sync-upstream.yml`。
- 需允许 Actions 创建 PR。GitHub 将该开关与“允许创建和批准 PR”放在一起；本工作流只创建 PR，不批准或自动合并。
- 需启用 Issues，用于报告同步冲突。
- 仅同步任务申请写入分支、PR、Issue 与触发 CI 的权限；CI 使用只读权限，检出时不保存令牌。
- 复制到其他 fork 时修改工作流的仓库名条件；上游地址固定在同步脚本中。

## 有冲突时手动处理

本地没有 `upstream` 时先添加一次：

```bash
git remote add upstream https://github.com/AlexeyInwerp/BoardRipper.git
```

在干净工作区操作：

```bash
git fetch origin
git fetch upstream
git switch -c sync-upstream-local origin/main
# 若已有远端同步分支，先合并它，保留上次自动同步历史；否则跳过此行
git merge origin/sync/upstream
git merge upstream/main
# 根据 git status 修正冲突，保留 uiText、中文目录和中文入口
git add <已解决的文件>
git commit
# 运行测试后推回同一同步分支，不使用 --force
git push origin HEAD:sync/upstream
```

解决后在 Actions 手动对 `sync/upstream` 运行 CI，确认 PR 对应提交通过验证。

## 新功能如何补中文

- 中文目录：`src/frontend/src/i18n/zh-CN.json`。
- 翻译入口：`src/frontend/src/i18n/index.ts`。
- 中文首页：`src/frontend/src/components/home/instructions.zh-CN.md`。
- 确认属于界面的英文才接入 `uiText('English text')` 或模板标签。动态参数在目录中使用 `{{0}}`、`{{1}}`。
- 文件名、位号、网络名及用户备注作为参数传入，保持原样；逻辑 ID、持久化键、DOM 选择器、格式字段和样式值不翻译。
- 未命中文案回退英文。尚未接入 `uiText` 的新文本不会自动进入目录。
- 现有测试验证已覆盖路径与占位符，不能证明所有新增英文均已翻译，需要人工检查 PR 的界面变化。
- 上游新增 Markdown 内容时更新对应中文说明；`README.en.md` 是初始汉化时保存的英文快照，最新原文以上游仓库为准。

## 合并前验证

```bash
cd src/frontend
npm ci
npm run test:unit
npx tsc -b --noEmit
npm run build:offline
npx playwright install chromium
npx playwright test --config playwright.chinese.config.ts
```

Windows 可设置 `BOARDRIPPER_BROWSER_CHANNEL=msedge` 使用 Edge。设置 `BOARDRIPPER_TEST_BOARD` 可额外验证本地真实 Allegro 文件，该文件不会纳入仓库。

英文 UI 测试使用 `BR_DEFAULT_LANGUAGE=en`，中文离线构建使用 `zh-CN`。上游变更构建方式、版本号、依赖或测试入口时一起检查 CI。

## 中文版更新与上游容器自更新

源码同步 PR、中文离线构建、上游容器签名更新是不同流程。上游容器更新器仍连接原项目发布源，不能保证中文分支持续保留。中文版容器请拉取本仓库后重新构建；离线版请下载新的成功构建并替换旧 HTML。
