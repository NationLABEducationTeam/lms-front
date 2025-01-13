import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listCategories, listCourses } from '@/services/api/courses';
import { S3Structure } from '@/types/s3';
import { Course } from '@/types/course';

interface CoursesState {
  categories: S3Structure[];  // 현재 보고 있는 경로의 폴더/파일 목록
  currentPath: string;        // 현재 경로
  courses: Course[];         // 현재 선택된 카테고리의 강의 목록
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  categories: [],
  currentPath: '',
  courses: [],
  loading: false,
  error: null,
};

// 카테고리 조회 (학생용)
export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (path: string = '') => {
    const response = await listCategories(path);
    return {
      items: response,
      path
    };
  }
);

// 강의 목록 조회 (관리자용)
export const fetchCoursesByCategory = createAsyncThunk(
  'courses/fetchCoursesByCategory',
  async ({ mainCategory, subCategory }: { mainCategory: string; subCategory: string }) => {
    const path = subCategory === 'all' ? mainCategory : `${mainCategory}/${subCategory}`;
    const response = await listCourses(path);
    return response.courses;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.currentPath = '';
      state.courses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 카테고리 조회
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.items.folders;
        state.currentPath = action.payload.path;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '카테고리를 불러오는데 실패했습니다.';
      })
      // 강의 목록 조회
      .addCase(fetchCoursesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCoursesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '강의 목록을 불러오는데 실패했습니다.';
      });
  },
});

export const { clearCategories } = coursesSlice.actions;
export default coursesSlice.reducer; 