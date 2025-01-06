import { DBUser } from '../../types/user';

const LAMBDA_URL = 'https://jbga5cl2emxbszroem4zw5pk6q0ejaee.lambda-url.ap-northeast-2.on.aws/';

export const getAllUsers = async (): Promise<DBUser[]> => {
  try {
    const response = await fetch(LAMBDA_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '사용자 목록을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data.data.map((user: any) => ({
      ...user,
      role: user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
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