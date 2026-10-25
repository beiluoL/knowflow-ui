import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 刻意不设置任何 alias、不改 resolve：组件库只能通过 package.json 的正常解析进入。
 * 这样一旦包产物缺文件、exports 写错或类型路径不对，构建会立刻失败。
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
