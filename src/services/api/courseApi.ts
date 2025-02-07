import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Course, CourseLevel, MainCategory, CourseStatus } from '@/types/course';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  main_category_id: MainCategory;
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
      try {
        const { tokens } = await fetchAuthSession();
        const token = tokens?.accessToken?.toString();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['Course'],
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
} = courseApi; 