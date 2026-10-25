import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * packages/ai 的 Library Mode 构建。
 *
 * 与 packages/ui 的差异：额外把 `@beiluol/knowflow-ui` 设为 external ——
 * AI 组件复用 UI 包的图标/复制按钮，不能把整份 UI 库再打进来（否则宿主装两个包会出现
 * 两套 token 与两份组件实现）。
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: 'KnowFlowAI',
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
