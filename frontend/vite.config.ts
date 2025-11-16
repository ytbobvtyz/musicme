import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Для поддержки __dirname в ES модулях
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    },
    // ⬇️ ПРОКСИ НА БЭКЕНД ЧЕРЕЗ DOCKER NETWORK
    proxy: {
      '/api': {
        target: 'http://backend:8000', // ← имя сервиса из docker-compose
        changeOrigin: true,
        secure: false,
      }
    }
  },
})

