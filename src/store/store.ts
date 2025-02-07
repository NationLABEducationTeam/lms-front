import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './features/courses/coursesSlice';
import authReducer from './features/auth/authSlice';
import { DBUser } from '@/types/user';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';
import { courseApi } from '@/services/api/courseApi';

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
  [courseApi.reducerPath]: ReturnType<typeof courseApi.reducer>;
}

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    auth: authReducer,
    [courseApi.reducerPath]: courseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(courseApi.middleware),
});

export type AppDispatch = typeof store.dispatch; 