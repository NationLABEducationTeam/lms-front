import { useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { DBUser } from '@/types/user';

// AuthError 타입 정의
interface AuthError extends Error {
  name: string;
  message: string;
  code?: string;
}

interface AuthState {
  user: DBUser | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // 필수 속성 타입 가드
      if (!attributes.sub || !attributes.email || !attributes.given_name || !attributes['custom:role']) {
        throw new Error('Required user attributes are missing');
      }

      // 역할 타입 가드
      const role = attributes['custom:role'];
      if (role !== 'ADMIN' && role !== 'INSTRUCTOR' && role !== 'STUDENT') {
        throw new Error('Invalid user role');
      }

      setAuthState({
        user: {
          cognito_user_id: attributes.sub,
          email: attributes.email,
          name: attributes.name,
          given_name: attributes.given_name,
          role: role,
          created_at: new Date().toISOString(),
        },
        loading: false,
        error: null,
      });
    } catch (err) {
      const error = err as Error | AuthError;
      setAuthState({
        user: null,
        loading: false,
        error: new Error(error.message || 'An unknown error occurred'),
      });
    }
  };

  return authState;
}; 