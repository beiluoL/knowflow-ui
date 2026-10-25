import { defineConfig } from '@playwright/test'

/**
 * Studio 浏览器回归配置。
 *
 * 为什么用 channel: 'chrome' 而不是下载 Playwright 自带 Chromium：
 *   本机已装 Google Chrome，走系统浏览器既省一次下载，也顺带验证「真实 Chrome」下的表现。
 * 断言只依赖可见结构与可访问属性（role / aria），不依赖内部类名，避免改样式就红。
 */
export default defineConfig({
  testDir: './tests/browser',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  outputDir: '../../docs/migration/v5-to-ui/evidence/browser-artifacts',
  use: {
    baseURL: 'http://localhost:5180',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
    trace: 'off',
  },
  webServer: {
    command: 'pnpm exec vite --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
