"""Exercise real Git merges without network access or GitHub credentials."""
from pathlib import Path
import tempfile
import unittest

from sync_upstream import ancestor, git, prepare_sync


class SyncHistoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.g('init', '-b', 'main')
        self.g('config', 'user.name', 'Sync Test')
        self.g('config', 'user.email', 'sync@example.invalid')
        self.g('config', 'core.autocrlf', 'false')
        self.write('viewer.txt', 'original\n')
        self.commit('initial')
        self.g('branch', 'upstream')
        self.write('zh.txt', '中文界面\n')
        self.commit('Chinese interface')

    def g(self, *args):
        return git(*args, cwd=self.root).stdout.strip()

    def write(self, name, text):
        (self.root / name).write_text(text, encoding='utf-8')

    def commit(self, message):
        self.g('add', '.')
        self.g('commit', '-m', message)

    def update(self, name='feature.txt', text='upstream feature\n'):
        self.g('checkout', 'upstream')
        self.write(name, text)
        self.commit('upstream feature')
        self.g('checkout', 'main')

    def test_no_update_leaves_default_branch_untouched(self):
        before = self.g('rev-parse', 'main')
        self.assertEqual(prepare_sync('main', 'upstream', cwd=self.root)['status'], 'current')
        self.assertEqual(self.g('rev-parse', 'HEAD'), before)

    def test_merge_preserves_chinese_and_both_histories(self):
        self.update()
        before = self.g('rev-parse', 'main')
        result = prepare_sync('main', 'upstream', cwd=self.root)
        self.assertEqual(result['status'], 'ready')
        self.assertEqual((self.root / 'zh.txt').read_text(encoding='utf-8'), '中文界面\n')
        self.assertTrue((self.root / 'feature.txt').exists())
        self.assertTrue(ancestor('main', 'HEAD', self.root))
        self.assertTrue(ancestor('upstream', 'HEAD', self.root))
        self.assertEqual(self.g('rev-parse', 'main'), before)

    def test_conflict_aborts_without_losing_chinese_changes(self):
        self.write('viewer.txt', '中文界面修改\n')
        self.commit('local change')
        before = self.g('rev-parse', 'main')
        self.update('viewer.txt', 'conflicting upstream change\n')
        result = prepare_sync('main', 'upstream', cwd=self.root)
        self.assertEqual(result, {'status': 'conflict', 'files': ['viewer.txt']})
        self.assertEqual(self.g('status', '--porcelain'), '')
        self.assertEqual(self.g('rev-parse', 'HEAD'), before)
        self.assertEqual((self.root / 'viewer.txt').read_text(encoding='utf-8'), '中文界面修改\n')

    def test_pending_branch_keeps_review_edits_and_accepts_new_updates(self):
        self.update()
        prepare_sync('main', 'upstream', cwd=self.root)
        self.write('review.txt', 'translation during PR review\n')
        self.commit('review translation')
        self.g('branch', 'pending')
        self.g('checkout', 'main')
        self.write('main-doc.txt', 'new documentation\n')
        self.commit('main documentation')
        self.update('next.txt', 'next upstream update\n')
        result = prepare_sync('main', 'upstream', 'pending', self.root)
        self.assertEqual(result['status'], 'ready')
        self.assertTrue(ancestor('pending', 'HEAD', self.root))
        for name in ['review.txt', 'main-doc.txt', 'next.txt', 'zh.txt']:
            self.assertTrue((self.root / name).exists())
        self.g('branch', '-f', 'pending', 'HEAD')
        again = prepare_sync('main', 'upstream', 'pending', self.root)
        self.assertFalse(again['changed'])

    def test_dirty_workspace_is_rejected(self):
        self.write('unsaved.txt', 'leave this alone')
        with self.assertRaises(RuntimeError):
            prepare_sync('main', 'upstream', cwd=self.root)
        self.assertEqual((self.root / 'unsaved.txt').read_text(), 'leave this alone')


if __name__ == '__main__':
    unittest.main()
