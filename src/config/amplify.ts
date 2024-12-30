import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-2_RWIv2Yp2f',
      userPoolClientId: '45f6aee3q7vgs7cj332i59897o',
      region: 'ap-northeast-2',
      identityPoolId: 'ap-northeast-2:d4b3a11d-7dfe-4e71-bb4a-a77e662cf2c1'
    }
  }
};

try {
  Amplify.configure(amplifyConfig);
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
} 