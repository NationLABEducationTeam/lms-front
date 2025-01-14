import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listCategories, listCourses } from '@/services/api/courses';
import { Course, CATEGORY_MAPPING } from '@/types/course';

interface CoursesState {
  courses: Course[];         // 현재 선택된 카테고리의 강의 목록
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
};

// 카테고리 조회 (학생용)
export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async () => {
    const categories = Object.entries(CATEGORY_MAPPING).map(([key, value]) => ({
      name: key,
      label: value
    }));
    return { categories };
  }
);

// 강의 목록 조회 (관리자용)
export const fetchCoursesByCategory = createAsyncThunk(
  'courses/fetchCoursesByCategory',
  async ({ mainCategory, subCategory }: { mainCategory: string; subCategory: string }) => {
    const response = await listCourses(mainCategory, subCategory);
    return response.courses;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourses: (state) => {
      state.courses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '카테고리를 불러오는데 실패했습니다.';
      })
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

export const { clearCourses } = coursesSlice.actions;
export default coursesSlice.reducer; 