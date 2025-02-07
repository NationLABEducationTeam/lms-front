// Lambda URLs
const LIST_STUDENT_COURSES_URL = 'https://ixnk2hrpzmae6rn7xa6dgox57a0fofid.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Course, CourseLevel, MainCategory, CourseStatus } from '@/types/course';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { S3Structure } from '@/types/s3';
import axios from 'axios';

interface ListResponse {
  folders: S3Structure[];
  files: S3Structure[];
}

interface CoursesResponse {
  courses: Course[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  main_category_id: string;
  sub_category_id: string;
  thumbnail?: File | null;
  level: CourseLevel;
  price: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  main_category_id?: MainCategory;
  sub_category_id?: string;
  level?: CourseLevel;
  price?: number;
  status?: CourseStatus;
  zoom_link?: string;
}

interface Week {
  weekNumber: number;
  materials: {
    [key: string]: {
      fileName: string;
      downloadUrl: string;
      lastModified: string;
      size: number;
    }[];
  };
}

interface CourseWithWeeks extends Course {
  weeks: Week[];
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(''),
    prepareHeaders: async (headers) => {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Course', 'Week'],
  endpoints: (builder) => ({
    // 공개 강의 목록 조회
    getPublicCourses: builder.query<Course[], void>({
      query: () => '/courses/public',
      transformResponse: (response: ApiResponse<{ courses: Course[] }>) => response.data.courses,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Course' as const, id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // 관리자용 강의 상세 조회
    getCourseById: builder.query<CourseWithWeeks, string>({
      query: (id) => `/admin/courses/${id}`,
      transformResponse: (response: ApiResponse<CourseWithWeeks>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    // 강의 생성
    createCourse: builder.mutation<Course, CreateCourseRequest>({
      queryFn: async (body) => {
        try {
          // Cognito 세션 확인
          const session = await fetchAuthSession();
          const token = session.tokens?.accessToken?.toString();
          
          if (!token) {
            throw new Error('로그인이 필요합니다.');
          }

          // Cognito 사용자 ID 가져오기
          const currentUser = await getCurrentUser();
          const instructorId = currentUser.userId;

          // Base64로 변환
          let thumbnailBase64 = null;
          if (body.thumbnail && body.thumbnail instanceof File) {
            const reader = new FileReader();
            thumbnailBase64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                  resolve(result);
                } else {
                  reject(new Error('Failed to convert thumbnail to base64'));
                }
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(body.thumbnail as File);
            });
          }

          // API 호출
          const response = await axios.post(
            getApiUrl('/admin/courses'),
            {
              title: body.title,
              description: body.description,
              instructor_id: instructorId,
              main_category_id: body.main_category_id,
              sub_category_id: body.sub_category_id,
              thumbnail_url: thumbnailBase64,
              price: body.price,
              level: body.level,
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data.success) {
            throw new Error(response.data.message || '강의 생성에 실패했습니다.');
          }

          return { data: response.data.data };
        } catch (error: any) {
          return {
            error: {
              status: error.response?.status || 500,
              data: error.message || '강의 생성에 실패했습니다.'
            }
          };
        }
      },
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),

    // 강의 수정
    updateCourse: builder.mutation<CourseWithWeeks, { id: string; body: UpdateCourseRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/courses/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<CourseWithWeeks>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // 강의 삭제
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // 새 주차 생성
    createWeek: builder.mutation<
      { courseId: string; weekNumber: number; folderPath: string },
      { courseId: string; weekNumber: number }
    >({
      query: ({ courseId, weekNumber }) => {
        console.log('Creating week with:', { courseId, weekNumber });
        return {
          url: `/admin/courses/${courseId}`,
          method: 'POST',
          body: { weekNumber },
        };
      },
      transformResponse: (response: ApiResponse<{ courseId: string; weekNumber: number; folderPath: string }>) => {
        console.log('Create week API response:', response);
        if (!response.success) {
          throw new Error(response.message || '새 주차 생성에 실패했습니다.');
        }
        return response.data;
      },
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        console.log('Starting createWeek mutation:', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('createWeek mutation successful:', data);
        } catch (error) {
          console.error('createWeek mutation failed:', error);
          throw error;
        }
      },
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }],
    }),

    // 파일 업로드를 위한 URL 조회
    getUploadUrls: builder.mutation<
      { urls: { fileName: string; url: string; key: string }[] },
      { courseId: string; weekNumber: number; files: { name: string; type: string; size: number }[] }
    >({
      query: ({ courseId, weekNumber, files }) => ({
        url: `/admin/courses/${courseId}/${weekNumber}/upload`,
        method: 'POST',
        body: { files },
      }),
      transformResponse: (response: ApiResponse<{ urls: { fileName: string; url: string; key: string }[] }>) => response.data,
    }),

    // 수강 중인 강의 목록 조회
    getEnrolledCourses: builder.query<CoursesResponse, void>({
      query: () => ({
        url: LIST_STUDENT_COURSES_URL,
        method: 'GET',
      }),
      providesTags: ['Course'],
    }),

    // 공개 강의 목록 조회
    listPublicCourses: builder.query<CoursesResponse, void>({
      query: () => ({
        url: '/courses/public',
        method: 'GET',
      }),
      providesTags: ['Course'],
    }),

    // 강의 상세 정보 조회 (학생용)
    getCourseDetail: builder.query<Course, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: 'GET',
      }),
      providesTags: ['Course'],
    }),

    // 카테고리 목록 조회
    listCategories: builder.query<MainCategory[], void>({
      query: () => ({
        url: '/courses/categories',
        method: 'GET',
      }),
    }),

    // 파일 다운로드 URL 조회
    getDownloadUrl: builder.mutation<string, { key: string }>({
      query: (body) => ({
        url: GET_DOWNLOAD_URL,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetUploadUrlsMutation,
  useCreateWeekMutation,
  useGetEnrolledCoursesQuery,
  useListPublicCoursesQuery,
  useGetCourseDetailQuery,
  useListCategoriesQuery,
  useGetDownloadUrlMutation,
} = courseApi; 