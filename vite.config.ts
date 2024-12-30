import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    define: {
      global: 'window',
      'process.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_ID),
      'process.env.VITE_COGNITO_APP_CLIENT_ID': JSON.stringify(env.VITE_COGNITO_APP_CLIENT_ID),
      'process.env.VITE_IDENTITY_POOL_ID': JSON.stringify(env.VITE_IDENTITY_POOL_ID),
      'process.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION)
    },
    resolve: {
      alias: {
        './runtimeConfig': './runtimeConfig.browser',
        '@': path.resolve(__dirname, './src'),
      },
    }
  }
})
