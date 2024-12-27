import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code',
      identityPoolId: import.meta.env.IDENTITY_POOL_ID
    }
  },
  Storage: {
    S3: {
      bucket: 'nationslab-lms-test-bucket',
      region: import.meta.env.AWS_REGION
    }
  }
}); 