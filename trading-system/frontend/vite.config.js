import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 4816,
    proxy: {
      '/api': {
        target: 'http://localhost:5649',
        changeOrigin: true
      }
    },
    historyApiFallback: true
  }
})
