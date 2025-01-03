import { signIn, signUp, confirmSignUp, getCurrentUser, fetchUserAttributes, signOut as awsSignOut } from 'aws-amplify/auth';
import { UserRole } from '../../config/cognito';

export const signInUser = async (username: string, password: string) => {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    if (isSignedIn) {
      const userAttributes = await fetchUserAttributes();
      return { isSignedIn, userAttributes };
    }
    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUpUser = async (username: string, password: string, email: string, role: UserRole, name: string) => {
  try {
    const { userId, isSignUpComplete } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          'custom:role': role,
          name
        }
      }
    });
    return { userId, isSignUpComplete };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const confirmSignUpUser = async (username: string, code: string) => {
  try {
    const { isSignUpComplete } = await confirmSignUp({ username, confirmationCode: code });
    return isSignUpComplete;
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
};

export const getCurrentUserInfo = async () => {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    return { currentUser, userAttributes };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await awsSignOut();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}; 