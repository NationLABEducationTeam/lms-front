import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  Course,
  S3Structure,
  listCourses,
  listMainCategories,
  listSubCategories,
  listCoursesByCategory,
  getCourseDetails
} from '@/services/api/courses';

interface CoursesState {
  categories: S3Structure[];
  subCategories: S3Structure[];
  courses: Course[];
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
    const categories = await listMainCategories();
    return categories;
  }
);

export const fetchSubCategories = createAsyncThunk(
  'courses/fetchSubCategories',
  async (mainCategory: string) => {
    const subCategories = await listSubCategories(mainCategory);
    return subCategories;
  }
);

export const fetchCoursesByCategory = createAsyncThunk(
  'courses/fetchCoursesByCategory',
  async ({ mainCategory, subCategory }: { mainCategory: string; subCategory: string }) => {
    const courses = await listCoursesByCategory(mainCategory, subCategory);
    return courses;
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchCourseDetails',
  async (coursePath: string) => {
    const details = await getCourseDetails(coursePath);
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
        state.courses = action.payload.map((item: S3Structure) => ({
          id: item.path,
          name: item.name,
          title: item.name,
          description: '',
          instructor: {
            id: '',
            name: '',
            email: ''
          },
          category: '',
          subcategory: '',
          totalWeeks: 0,
          enrolledStudents: 0,
          status: 'SCHEDULED'
        }));
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

export const { clearSelectedCourse } = coursesSlice.actions;
export default coursesSlice.reducer; 