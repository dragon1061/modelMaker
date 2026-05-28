import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署在子路径下，需要设置 base
  base: '/modelMaker/',
  plugins: [vue()],
  build: {
    // 拆分包：把 three.js 单独打包，利用浏览器缓存
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) {
            return 'three'
          }
          if (id.includes('node_modules/vue/')) {
            return 'vue'
          }
        },
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
