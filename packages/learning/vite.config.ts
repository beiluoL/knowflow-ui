import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * packages/learning 的 Library Mode 构建。
 *
 * 与 packages/ui 的差异：`@beiluol/knowflow-ui` 设为 external ——
 * 学习组件复用 UI 包的按钮/图标/进度条，不能把整份 UI 库再打进来。
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: 'KnowFlowLearning',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', '@beiluol/knowflow-ui'],
      output: { globals: { vue: 'Vue' } },
    },
    cssCodeSplit: false,
    sourcemap: false,
    emptyOutDir: true,
    minify: false,
    target: 'es2020',
  },
})
