import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
      '@': path.resolve(__dirname, './src'),
    },
  }
})
