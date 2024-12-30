import { Amplify } from 'aws-amplify';

console.log('=== Amplify Configuration Debug ===');
console.log('Raw env values:', {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION,
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID
});

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION || 'ap-northeast-2',
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID
    }
  }
};

console.log('Amplify configuration:', amplifyConfig);

try {
  Amplify.configure(amplifyConfig);
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
} 