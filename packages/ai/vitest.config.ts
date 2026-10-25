import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 测试与类型检查都指向源码，避免依赖 ui 包的构建产物顺序
      '@beiluol/knowflow-ui': fileURLToPath(new URL('../ui/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    globals: false,
    restoreMocks: true,
    css: false,
  },
})
