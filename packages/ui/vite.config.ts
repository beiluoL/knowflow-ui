import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Library Mode 构建：
 *  - 产出 ESM 单包 + 独立 CSS + 类型声明（types 由 vue-tsc 生成，见 package.json build 脚本）
 *  - vue 必须 external，避免消费方出现第二个 Vue 运行时
 *  - 无 UMD/CJS：目标消费方是 Vite / Rollup / webpack5 等现代打包器
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: 'KnowFlowUI',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rollupOptions: {
      // 仅 vue 为运行时依赖；tokens 的 CSS 在构建时内联进 style.css
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    emptyOutDir: true,
    minify: false,
    target: 'es2020',
  },
})
