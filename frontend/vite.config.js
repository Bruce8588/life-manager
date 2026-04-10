import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/life/',
  plugins: [react()],
  server: {
    port: 8975,
    proxy: {
      '/api': {
        target: 'http://localhost:5649',
        changeOrigin: true
      }
    },
    historyApiFallback: true
  }
})
