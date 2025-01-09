import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listCategories, listCourses } from '@/services/api/courses';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';

interface CoursesState {
  categories: S3Structure[];
  subCategories: S3Structure[];
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  categories: [],
  subCategories: [],
  courses: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async () => {
    const response = await listCategories();
    return response.folders;
  }
);

export const fetchSubCategories = createAsyncThunk(
  'courses/fetchSubCategories',
  async (mainCategory: string) => {
    const response = await listCategories(mainCategory);
    return response.folders;
  }
);

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
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '카테고리를 불러오는데 실패했습니다.';
      })
      // fetchSubCategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '하위 카테고리를 불러오는데 실패했습니다.';
      })
      // fetchCoursesByCategory
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