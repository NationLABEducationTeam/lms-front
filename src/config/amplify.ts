import { Amplify } from 'aws-amplify';

// 환경 변수 로드 확인을 위한 상세 로깅
console.log('=== Amplify Configuration Debug ===');
const envValues = {
  VITE_COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_APP_CLIENT_ID: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  VITE_IDENTITY_POOL_ID: import.meta.env.VITE_IDENTITY_POOL_ID,
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION
};
console.log('Raw env values:', envValues);

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID
    }
  }
};

console.log('Amplify configuration:', JSON.stringify(amplifyConfig, null, 2));

try {
  Amplify.configure(amplifyConfig);
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
} 