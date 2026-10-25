import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

/**
 * Studio 测试沿用 vite.config.ts 的 alias，保证测试里 import 的
 * `@beiluol/knowflow-ui` / `-ai` / `-learning` 与运行时是**同一份源码**。
 *
 * include 只收 `src/**`：
 *   - `tests/browser/**` 是 Playwright 用例，由 `playwright test` 跑（它自己会起 dev server）；
 *   - `tests/tools/**` 是文档导出工具，按需手动执行（`npx vitest run tests/tools/dump-registry.spec.ts`）。
 * 两者都不该混进 `pnpm test`，否则会出现「vitest 试图执行 Playwright 用例」的假失败。
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.spec.ts'],
      globals: false,
      restoreMocks: true,
      css: false,
    },
  }),
)
