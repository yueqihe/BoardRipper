import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = pathToFileURL(path.resolve(here, '../dist-offline/boardripper-lite.html')).href;
const fixture = path.resolve(here, '../public/samples/test-board.bvr');

async function skipWelcome(page: Page) {
  const button = page.getByRole('button', { name: /^(暂时跳过|Skip for now)$/ });
  if (await button.isVisible()) await button.click();
}

test('Chinese offline viewer opens a board and PDF without external requests', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  const failed: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
  page.on('requestfailed', request => failed.push(request.url()));
  await page.goto(html);
  await expect(page.getByTestId('language-select')).toHaveValue('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await skipWelcome(page);
  await page.getByTestId('file-input').setInputFiles(fixture);
  await expect(page.getByTestId('statusbar')).toContainText('元件：');
  await expect(page.locator('canvas').first()).toBeVisible();
  await page.getByTestId('file-input').setInputFiles(path.resolve(here, 'fixtures/two-page-text.pdf'));
  await expect(page.locator('body')).toContainText('two-page-text.pdf');
  await expect(page.locator('canvas')).not.toHaveCount(0);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  expect(failed).toEqual([]);
});

test('the bundled sample board opens offline without missing resources', async ({ page }) => {
  const failed: string[] = [];
  page.on('requestfailed', request => failed.push(request.url()));
  await page.goto(html);
  await skipWelcome(page);
  await page.getByTestId('home-sample-btn').click();
  await expect(page.getByTestId('statusbar')).toContainText('KICAD');
  await expect(page.locator('body')).toContainText('tomu-fpga.kicad_pcb');
  expect(failed).toEqual([]);
});

test('language changes persist and retain a saved quality setting', async ({ page }) => {
  await page.goto(html);
  await skipWelcome(page);
  await page.getByTestId('quality-preset-fastest').first().click();
  await page.getByTestId('language-select').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await skipWelcome(page);
  await expect(page.getByTestId('open-btn')).toContainText('Open');
  await expect(page.getByTestId('quality-preset-fastest').first()).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(page.getByTestId('language-select')).toHaveValue('en');
  await skipWelcome(page);
  await page.getByTestId('language-select').selectOption('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByTestId('open-btn')).toContainText('打开');
});

test('settings can be searched with Chinese PCB terms', async ({ page }) => {
  await page.goto(html);
  await skipWelcome(page);
  await page.getByRole('tab', { name: '设置', exact: true }).click();
  const panel = page.getByTestId('settings-panel');
  await expect(panel).toBeVisible();
  const search = panel.getByPlaceholder(/搜索设置/);
  await search.fill('引脚');
  await expect(panel).toContainText('引脚');
  await expect(panel).not.toContainText('没有匹配项');
});

test('an optional real Allegro board still loads with original names', async ({ page }) => {
  test.skip(!process.env.BOARDRIPPER_TEST_BOARD, 'Set BOARDRIPPER_TEST_BOARD to a local Allegro .brd');
  await page.goto(html);
  await skipWelcome(page);
  const boardPath = process.env.BOARDRIPPER_TEST_BOARD!;
  await page.getByTestId('file-input').setInputFiles(boardPath);
  await expect(page.getByTestId('statusbar')).toContainText('ALLEGRO_BRD');
  await expect(page.getByTestId('statusbar')).toContainText('元件：');
  await expect(page.locator('body')).toContainText(path.basename(boardPath));
  await expect(page.locator('canvas').first()).toBeVisible();
  const layers = page.getByTestId('layer-list');
  await expect(layers).toContainText('4');
  await layers.getByTitle('隐藏走线', { exact: true }).click();
  await expect(layers.getByTitle('显示走线', { exact: true })).toBeVisible();
  await layers.getByTitle('显示走线', { exact: true }).click();
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await page.getByPlaceholder('搜索元件或网络…').fill('U1');
  await page.locator('.search-tab-suggestion').filter({ has: page.locator('.suggestion-label', { hasText: /^U1$/ }) }).click();
  await page.locator('.part-item').filter({ has: page.locator('.result-name', { hasText: /^U1$/ }) }).click();
  await expect(page.getByTestId('statusbar')).toContainText('已选择： U1');
  await page.getByRole('button', { name: '图层', exact: true }).click();
  const dismiss = page.getByRole('button', { name: '关闭加载进度浮层', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.getByTitle('缩放至完整板图', { exact: true }).click();
  await page.screenshot({ path: path.resolve(here, '../test-results/chinese-allegro.png') });
});
