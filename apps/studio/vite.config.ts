import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Studio 直接以「源码」消费三个组件包（alias 到各自 src/index.ts）：
 *  - 改组件样式可即时 HMR，不必先跑一次库构建；
 *  - 消费的仍是本仓库 packages 内的真实组件，**不跨目录 import 原 KnowFlow 项目**；
 *  - 发布链路是否可用由 examples/vue-vite（安装 tgz 产物）单独验证。
 */
const src = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // 精确匹配包名，避免把 'xxx/style.css' 拼成 'index.ts/style.css'
      {
        find: /^@beiluol\/knowflow-ui$/,
        replacement: src('../../packages/ui/src/index.ts'),
      },
      {
        find: /^@beiluol\/knowflow-ui\/style\.css$/,
        replacement: src('../../packages/ui/src/styles/index.css'),
      },
      {
        find: /^@beiluol\/knowflow-ai$/,
        replacement: src('../../packages/ai/src/index.ts'),
      },
      {
        find: /^@beiluol\/knowflow-learning$/,
        replacement: src('../../packages/learning/src/index.ts'),
      },
      {
        find: /^@beiluol\/knowflow-tokens$/,
        replacement: src('../../packages/tokens/src/index.ts'),
      },
      {
        find: /^@beiluol\/knowflow-tokens\/tokens\.css$/,
        replacement: src('../../packages/tokens/src/tokens.css'),
      },
    ],
  },
  server: {
    // 原 KnowFlow 前端常用 5173；Studio 固定用 5180，被占用时 Vite 自动顺延
    port: 5180,
    strictPort: false,
  },
  preview: {
    port: 4180,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
