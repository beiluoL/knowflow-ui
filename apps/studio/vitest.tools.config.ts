import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

/**
 * 工具用配置：只跑 `tests/tools/**`。
 *
 * 为什么不并进 `vitest.config.ts`：`tests/tools/dump-registry.spec.ts` 会把注册表写进
 * `artifacts/registry-dump.json`，它是「文档生成」的输入，属于有副作用的工具，
 * 不该在每次 `pnpm test` 里顺手改仓库文件。
 *
 * 用法：`pnpm dump:registry`（等价于 `npx vitest run --config vitest.tools.config.ts`）
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['tests/tools/**/*.spec.ts'],
      globals: false,
    },
  }),
)
