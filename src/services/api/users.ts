import { fetchAuthSession } from 'aws-amplify/auth';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

export const getAllUsers = async () => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.USERS), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '사용자 목록을 불러오는데 실패했습니다.');
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// 캐시 무효화 (전체)
export const invalidateCache = async (): Promise<void> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`${API_ENDPOINTS.USERS}/invalidate`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to invalidate cache');
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
};

export const getStudents = async () => {
  const data = await getAllUsers();
  return data.users;
}; 