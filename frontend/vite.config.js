import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 关键：必须和访问路径一致，否则静态资源/路由全错
  base: '/life/',
  plugins: [react()],
  server: {
    // 仅开发环境生效，生产环境由 Nginx 处理
    proxy: {
      '/api': {
        target: 'http://localhost:5649',
        changeOrigin: true,
        // 确保 /api/xxx 正确转发，不修改路径
        rewrite: (path) => path
      }
    },
    historyApiFallback: true
  },
  build: {
    // 打包输出目录，和 Nginx 配置对应
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
