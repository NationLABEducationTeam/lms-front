import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 3001
    },
    define: {
      'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_ID || 'ap-northeast-2_RWIv2Yp2f'),
      'import.meta.env.VITE_COGNITO_APP_CLIENT_ID': JSON.stringify(env.VITE_COGNITO_APP_CLIENT_ID || '45f6aee3q7vgs7cj332i59897o'),
      'import.meta.env.VITE_IDENTITY_POOL_ID': JSON.stringify(env.VITE_IDENTITY_POOL_ID || 'ap-northeast-2:d4b3a11d-7dfe-4e71-bb4a-a77e662cf2c1'),
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION || 'ap-northeast-2'),
      global: 'window'
    },
    resolve: {
      alias: {
        './runtimeConfig': './runtimeConfig.browser',
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components')
      }
    }
  }
})
