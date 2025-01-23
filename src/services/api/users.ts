import { DBUser } from '../../types/user';
import { fetchAuthSession } from 'aws-amplify/auth';

const LAMBDA_URL = 'https://5bcilg42fyfb6eww3ubuvezbyy0cbfrs.lambda-url.ap-northeast-2.on.aws';

export const getAllUsers = async (): Promise<DBUser[]> => {
  try {
    // Get the current session to extract the JWT token
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    console.log('=== JWT Token for testing ===');
    console.log(token);
    console.log('===========================');

    const response = await fetch(LAMBDA_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '사용자 목록을 불러오는데 실패했습니다.');
    }

    const { data, source } = await response.json();
    console.log('Data source:', source); // 'cache' 또는 'database'

    return data.map((user: any) => ({
      cognito_user_id: user.cognito_user_id,
      email: user.email,
      name: user.name,
      given_name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// 캐시 무효화 (전체)
export const invalidateCache = async (): Promise<void> => {
  try {
    // Get the current session to extract the JWT token
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`${LAMBDA_URL}/invalidate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to invalidate cache');
    }
    
    console.log('Cache invalidated successfully');
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
};

export const getStudents = async (): Promise<DBUser[]> => {
  try {
    const users = await getAllUsers();
    return users.filter(user => user.role === 'STUDENT');
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}; 