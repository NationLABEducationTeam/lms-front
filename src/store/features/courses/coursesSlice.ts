import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  listMainCategories,
  listSubCategories,
  listCoursesByCategory,
  getCourseDetails
} from '@/services/api/courses';
import { S3Structure } from '@/types/s3';

interface CoursesState {
  categories: S3Structure[];
  subCategories: S3Structure[];
  courses: S3Structure[];
  selectedCourse: {
    meta: any;
    weeks: S3Structure[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  categories: [],
  subCategories: [],
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async () => {
    console.log('Fetching main categories...');
    const categories = await listMainCategories();
    console.log('Fetched categories:', categories);
    return categories;
  }
);

export const fetchSubCategories = createAsyncThunk(
  'courses/fetchSubCategories',
  async (mainCategory: string) => {
    console.log('Fetching sub categories for:', mainCategory);
    const subCategories = await listSubCategories(mainCategory);
    console.log('Fetched sub categories:', subCategories);
    return subCategories;
  }
);

export const fetchCoursesByCategory = createAsyncThunk(
  'courses/fetchCoursesByCategory',
  async ({ mainCategory, subCategory }: { mainCategory: string; subCategory: string }) => {
    console.log('Fetching courses for:', { mainCategory, subCategory });
    const courses = await listCoursesByCategory(mainCategory, subCategory);
    console.log('Fetched courses:', courses);
    return courses;
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchCourseDetails',
  async (coursePath: string) => {
    console.log('Fetching course details for:', coursePath);
    const details = await getCourseDetails(coursePath);
    console.log('Fetched course details:', details);
    return details;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
    clearCourses: (state) => {
      state.courses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 카테고리 로딩
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
      // 서브카테고리 로딩
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
        state.error = action.error.message || '서브카테고리를 불러오는데 실패했습니다.';
      })
      // 강의 목록 로딩
      .addCase(fetchCoursesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        // 새로운 강의들을 기존 목록에 추가 (중복 제거)
        const newCourses = action.payload.filter(
          (newCourse: S3Structure) => 
            !state.courses.some(
              (existingCourse: S3Structure) => existingCourse.path === newCourse.path
            )
        );
        state.courses = [...state.courses, ...newCourses];
      })
      .addCase(fetchCoursesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '강의 목록을 불러오는데 실패했습니다.';
      })
      // 강의 상세 정보 로딩
      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '강의 상세 정보를 불러오는데 실패했습니다.';
      });
  },
});

export const { clearSelectedCourse, clearCourses } = coursesSlice.actions;
export default coursesSlice.reducer; 