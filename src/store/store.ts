import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import coursesReducer from './features/courses/coursesSlice';
import authReducer from './features/auth/authSlice';
import { DBUser } from '@/types/user';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';
import { courseApi } from '@/services/api/courseApi';
import { zoomApi } from '@/services/api/zoomApi';
import { studentApi } from '@/services/api/studentApi';
import { adminApi } from '@/services/api/adminApi';

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
  [zoomApi.reducerPath]: ReturnType<typeof zoomApi.reducer>;
  [studentApi.reducerPath]: ReturnType<typeof studentApi.reducer>;
  [adminApi.reducerPath]: ReturnType<typeof adminApi.reducer>;
}

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    auth: authReducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [zoomApi.reducerPath]: zoomApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      courseApi.middleware, 
      zoomApi.middleware,
      studentApi.middleware,
      adminApi.middleware
    ),
});

// API 호출 결과에 대한 리스너 설정
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch; 