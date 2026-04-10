import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/reading/',
  plugins: [react()],
  server: {
    port: 6789,
    proxy: {
      '/api/reading': {
        target: 'http://localhost:5649',
        changeOrigin: true
      }
    },
    historyApiFallback: true
  }
})
