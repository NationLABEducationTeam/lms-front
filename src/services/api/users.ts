import { DBUser } from '../../types/user';
import { getAllUsers as dbGetAllUsers, getStudents as dbGetStudents } from '../../lib/dynamodb';

const transformUser = (user: any): DBUser => {
  return {
    ...user,
    role: user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  };
};

export const getAllUsers = async (): Promise<DBUser[]> => {
  try {
    const users = await dbGetAllUsers();
    return users.map(transformUser);
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getStudents = async (): Promise<DBUser[]> => {
  try {
    const students = await dbGetStudents();
    return students.map(transformUser);
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}; 