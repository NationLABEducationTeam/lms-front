/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AWS_ACCESS_KEY_ID: string
  readonly AWS_SECRET_ACCESS_KEY: string
  readonly AWS_REGION: string
  readonly COGNITO_APP_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 