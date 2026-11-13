import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /chinese-ui\.spec\.ts/,
  timeout: 60000,
  workers: 1,
  use: {
    headless: true,
    channel: process.env.BOARDRIPPER_BROWSER_CHANNEL,
    viewport: { width: 1440, height: 960 },
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
});
