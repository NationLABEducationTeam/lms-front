import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './features/courses/coursesSlice';
import authReducer from './features/auth/authSlice';
import { DBUser } from '@/types/user';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';

interface CoursesState {
  categories: S3Structure[];
  currentPath: string;
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  courses: CoursesState;
  auth: {
    user: DBUser | null;
    loading: boolean;
    error: Error | null;
  };
}

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch; 