import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Studio 直接以「源码」消费组件包（alias 到 packages/ui/src/index.ts）：
 *  - 改组件样式可即时 HMR，不必先跑一次库构建；
 *  - 仍然是新包里的真实组件，不跨项目 import 原 KnowFlow；
 *  - 发布链路是否可用由 examples/vue-vite（安装 tgz 产物）单独验证。
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // 精确匹配包名，避免把 '@beiluol/knowflow-ui/style.css' 拼成 'index.ts/style.css'
      {
        find: /^@beiluol\/knowflow-ui$/,
        replacement: fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)),
      },
      {
        find: /^@beiluol\/knowflow-ui\/style\.css$/,
        replacement: fileURLToPath(new URL('../../packages/ui/src/styles/index.css', import.meta.url)),
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
