// Lambda URLs (hybrid)
const LIST_STUDENT_COURSES_URL = 'https://ixnk2hrpzmae6rn7xa6dgox57a0fofid.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Course, CourseLevel, MainCategory, CourseStatus, CourseType, CATEGORY_MAPPING, MainCategoryId, WeekMaterial, CourseResponse, CourseListResponse, Timemark, TimemarkResponse, TimemarkListResponse, CourseNotesResponse, GradeItem } from '@/types/course';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { S3Structure } from '@/types/s3';
import axios from 'axios';
import { baseQueryWithReauth } from '@/services/api/baseQuery';

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
  classmode: 'ONLINE' | 'VOD';
  zoom_link?: string | null;
  weeks_count?: number;
  assignment_count?: number;
  exam_count?: number;
  gradeRules?: {
    attendance_weight: number;
    assignment_weight: number;
    exam_weight: number;
    min_attendance_rate: number;
  };
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

// 백엔드 응답을 위한 인터페이스
interface BackendMaterial {
  fileName: string;
  downloadUrl: string;
  lastModified: string;
  size: number;
  downloadable?: boolean;
  type?: string;
}

interface Week {
  weekName: string;
  weekNumber: number;
  materials: {
    [key: string]: BackendMaterial[];
  };
}

interface CourseWithWeeks extends Course {
  weeks: Week[];
  zoom_link?: string;
  classmode: 'ONLINE' | 'VOD';
  gradeRules?: {
    attendance_weight: number;
    assignment_weight: number;
    exam_weight: number;
    min_attendance_rate: number;
  };
}

export interface CreateGradeItemRequest {
  courseId: string;
  type: 'ASSIGNMENT' | 'ATTENDANCE' | 'EXAM';
  title: string;
  max_score?: number;
  weight?: number;
  deadline?: string;
  files?: { name: string; type: string; size: number }[];
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 30, // 글로벌 캐시 시간 설정
  refetchOnMountOrArgChange: true, // 컴포넌트 마운트시 항상 리페치
  refetchOnFocus: false, // 포커스시 리페치 비활성화
  tagTypes: ['Course', 'Week', 'Timemark', 'CourseNotes', 'GradeItems', 'GradeItemFiles'],
  endpoints: (builder) => ({
    // 공개 강의 목록 조회
    getPublicCourses: builder.query<Course[], void>({
      query: () => '/courses/public',
      transformResponse: (response: ApiResponse<{ courses: Course[] }>) => response.data.courses,
      providesTags: (result: Course[] | undefined) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: 'Course' as const, id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // 관리자용 강의 상세 조회
    getCourseById: builder.query<CourseWithWeeks, string>({
      query: (id: string) => ({
        url: `/admin/courses/${id}`,
        method: 'GET',
        responseHandler: async (response: Response) => {
          if (!response.ok) {
            const error = await response.json();
            return Promise.reject(error);
          }
          const data = await response.json();
          console.log('Server response for getCourseById:', data);
          return data;
        },
      }),
      transformResponse: (response: ApiResponse<{ course: Course & { weeks: Week[] } }>) => {
        console.log('Transforming response:', response);
        if (!response.success) {
          throw new Error(response.message || '강의 정보를 불러오는데 실패했습니다.');
        }

        // weeks가 undefined인 경우 빈 배열로 처리
        const weeks = response.data.course.weeks || [];
        
        // 주차별 파일을 타입별로 분류
        const transformedWeeks = weeks.map(week => {
          const categorizedMaterials: { [key: string]: WeekMaterial[] } = {
            quiz: [],
            document: [],
            video: [],
            image: [],
            spreadsheet: [],
            unknown: []
          };

          // 파일들을 카테고리별로 분류
          Object.entries(week.materials || {}).forEach(([category, files]) => {
            files.forEach((file: BackendMaterial) => {
              const targetCategory = category === 'json' ? 'quiz' : category;
              const materialWithPermission: WeekMaterial = {
                fileName: file.fileName,
                downloadUrl: file.downloadUrl,
                lastModified: file.lastModified,
                size: file.size,
                downloadable: file.downloadable ?? true // isDownloadable 대신 downloadable 사용
              };
              
              if (targetCategory in categorizedMaterials) {
                categorizedMaterials[targetCategory].push(materialWithPermission);
              } else {
                console.warn(`Unknown category: ${category}, file: ${file.fileName}`);
                categorizedMaterials.unknown.push(materialWithPermission);
              }
            });
          });

          return {
            ...week,
            weekName: `week${week.weekNumber}`,
            materials: categorizedMaterials
          };
        });

        const result = {
          ...response.data.course,
          weeks: transformedWeeks
        };
        console.log('Transformed result:', result);
        return result;
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        return {
          status: response.status,
          message: response.data?.message || '강의 정보를 불러오는데 실패했습니다.'
        };
      },
      async onQueryStarted(id: string, { queryFulfilled }: { queryFulfilled: Promise<any> }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.debug('Query error handled:', error);
        }
      },
      providesTags: (_result: any, _error: any, id: string) => [{ type: 'Course', id }],
    }),

    // 강의 생성
    createCourse: builder.mutation<Course, CreateCourseRequest>({
      queryFn: async (body: CreateCourseRequest) => {
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
              classmode: body.classmode,
              zoom_link: body.zoom_link,
              weeks_count: body.weeks_count,
              assignment_count: body.assignment_count,
              exam_count: body.exam_count,
              gradeRules: body.gradeRules
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
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

    // 강의 수정 (관리자)
    updateCourse: builder.mutation<CourseWithWeeks, { id: string; body: UpdateCourseRequest }>({
      query: ({ id, body }: { id: string; body: UpdateCourseRequest }) => ({
        url: `/admin/courses/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<CourseWithWeeks>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // 강의 삭제 (관리자)
    deleteCourse: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/admin/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result: any, _error: any, id: string) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // 새 주차 생성 (관리자)
    createWeek: builder.mutation<
      { courseId: string; weekNumber: number; folderPath: string },
      { courseId: string; weekNumber: number }
    >({
      query: ({ courseId, weekNumber }: { courseId: string; weekNumber: number }) => ({
        url: `/admin/courses/${courseId}`,
        method: 'POST',
        body: { weekNumber },
      }),
      transformResponse: (response: ApiResponse<{ courseId: string; weekNumber: number; folderPath: string }>) => {
        if (!response.success) {
          throw new Error(response.message || '새 주차 생성에 실패했습니다.');
        }
        return response.data;
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // 에러 발생 시 조용히 처리
        }
      },
      invalidatesTags: (_result, _error, { courseId }) => [{ type: 'Course', id: courseId }],
    }),

    // 파일 업로드를 위한 URL 조회 (관리자)
    getUploadUrls: builder.mutation<
      { urls: { fileName: string; url: string; key: string }[] },
      { courseId: string; weekNumber: number; files: { name: string; type: string; size: number }[] }
    >({
      query: ({ courseId, weekNumber, files }: {
        courseId: string;
        weekNumber: number;
        files: { name: string; type: string; size: number }[];
      }) => ({
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
      queryFn: () => {
        const categories: MainCategory[] = Object.entries(CATEGORY_MAPPING).map(([id, name]) => ({
          id: id as MainCategoryId,
          name,
          sub_categories: []  // 서브 카테고리는 빈 배열로 초기화
        }));
        return { data: categories };
      }
    }),

    // 파일 다운로드 URL 조회
    getDownloadUrl: builder.mutation<string, { key: string }>({
      query: (body) => ({
        url: GET_DOWNLOAD_URL,
        method: 'POST',
        body,
      }),
    }),

    // 강의 상태 토글
    toggleCourseStatus: builder.mutation<Course, string>({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/toggle-status`,
        method: 'PUT',
      }),
      transformResponse: (response: ApiResponse<{ course: Course }>) => {
        if (!response.success) {
          throw new Error(response.message || '강의 상태 변경에 실패했습니다.');
        }
        return response.data.course;
      },
      invalidatesTags: (_result, _error, courseId) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' }
      ],
    }),

    updateMaterialPermission: builder.mutation<
      { success: boolean; message: string; data: { isDownloadable: boolean } },
      { courseId: string; weekNumber: number; fileName: string; isDownloadable: boolean }
    >({
      query: ({ courseId, weekNumber, fileName, isDownloadable }) => ({
        url: `/admin/courses/${courseId}/materials/${weekNumber}/${fileName}/permission`,
        method: 'PUT',
        body: { isDownloadable },
      }),
      async onQueryStarted({ courseId, weekNumber, fileName, isDownloadable }: {
        courseId: string;
        weekNumber: number;
        fileName: string;
        isDownloadable: boolean;
      }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          courseApi.util.updateQueryData('getCourseById', courseId, (draft: CourseWithWeeks) => {
            const week = draft.weeks?.find((w: { weekNumber: number }) => w.weekNumber === weekNumber);
            if (week && week.materials) {
              Object.entries(week.materials).forEach(([_, materials]) => {
                materials.forEach((material: WeekMaterial) => {
                  if (material.fileName === fileName) {
                    material.downloadable = isDownloadable;
                  }
                });
              });
            }
          })
        );

        try {
          const result = await queryFulfilled;
          // 서버 응답이 성공적이면 낙관적 업데이트를 유지
        } catch {
          // 서버 요청이 실패하면 낙관적 업데이트를 되돌림
          patchResult.undo();
          // 캐시를 무효화하여 서버에서 새로운 데이터를 가져오도록 함
          dispatch(courseApi.util.invalidateTags([{ type: 'Course', id: courseId }]));
        }
      },
    }),

    // Timemark endpoints
    createTimemark: builder.mutation<TimemarkResponse, { courseId: string; videoId: string; timestamp: number; content: string }>({
      query: (body) => ({
        url: '/timemarks',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result: any, _error: any, { courseId, videoId }) => [
        { type: 'Timemark', id: `${courseId}-${videoId}` }
      ],
    }),

    getTimemarks: builder.query<TimemarkListResponse, { courseId: string; videoId: string }>({
      query: ({ courseId, videoId }) => `/timemarks/${courseId}/${videoId}`,
      providesTags: (_result: any, _error: any, { courseId, videoId }) => [
        { type: 'Timemark', id: `${courseId}-${videoId}` }
      ],
    }),

    updateTimemark: builder.mutation<TimemarkResponse, { timemarkId: string; timestamp: number; content: string }>({
      query: ({ timemarkId, ...body }: { timemarkId: string; timestamp: number; content: string }) => ({
        url: `/timemarks/${timemarkId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result: any, _error: any, { timemarkId }: { timemarkId: string }) => [
        { type: 'Timemark', id: timemarkId }
      ],
      async onQueryStarted({ timemarkId }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedTimemark = response.data;
          
          // 타임마크 목록 쿼리 업데이트
          dispatch(
            courseApi.util.updateQueryData('getTimemarks', 
              { courseId: updatedTimemark.courseId, videoId: updatedTimemark.videoId }, 
              (draft) => {
                const index = draft.data.findIndex(t => t.id === timemarkId);
                if (index !== -1) {
                  draft.data[index] = updatedTimemark;
                }
            })
          );
        } catch {
          // 실패 시 자동으로 재요청됨
        }
      },
    }),

    deleteTimemark: builder.mutation<{ success: boolean; message: string }, { timemarkId: string; timestamp: number }>({
      query: ({ timemarkId, timestamp }: { timemarkId: string; timestamp: number }) => ({
        url: `/timemarks/${timemarkId}?timestamp=${timestamp}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result: any, _error: any, { timemarkId }: { timemarkId: string }) => [
        { type: 'Timemark', id: timemarkId }
      ],
    }),

    // 새로운 엔드포인트 추가
    getAllNotes: builder.query<CourseNotesResponse, void>({
      query: () => ({
        url: '/timemarks/notes/all',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      providesTags: ['Timemark']
    }),

    // 성적 항목 생성
    createGradeItem: builder.mutation<GradeItem, CreateGradeItemRequest>({
      query: (body) => ({
        url: `/admin/grades/items`,
        method: 'POST',
        body: {
          courseId: body.courseId,
          type: body.type,
          title: body.title,
          due_date: body.deadline,
          files: body.files
        }
      }),
      transformResponse: (response: ApiResponse<any>, _meta, arg) => {
        console.log('성적 항목 생성 응답:', response);
        if (!response.data) {
          throw new Error('성적 항목 생성에 실패했습니다.');
        }
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const item = response.data;
        const result = {
          id: item.item_id || `temp-${Math.random()}`,
          type: item.item_type || arg.type,
          title: item.item_name || arg.title,
          deadline: item.due_date || arg.deadline,
          item_id: item.item_id,
          course_id: item.course_id,
          item_type: item.item_type,
          item_name: item.item_name,
          item_order: item.item_order,
          due_date: item.due_date,
          created_at: item.created_at,
          updated_at: item.updated_at,
          uploadUrls: item.uploadUrls || []
        };
        
        return result;
      },
      invalidatesTags: (result, error, arg) => [{ type: 'GradeItems', id: arg.courseId }]
    }),
    
    // 성적 항목 목록 조회
    getGradeItems: builder.query<GradeItem[], string>({
      query: (courseId) => getApiUrl(`/admin/grades/items/${courseId}`),
      transformResponse: (response: ApiResponse<any[]>) => {
        console.log('성적 항목 API 원본 응답:', response);
        // 응답 데이터가 없거나 배열이 아닌 경우 빈 배열 반환
        if (!response.data || !Array.isArray(response.data)) {
          console.log('성적 항목 데이터가 없거나 배열이 아님, 빈 배열 반환');
          return [];
        }
        
        // 백엔드 응답 형식을 프론트엔드 형식으로 변환
        const transformedItems = response.data.map(item => ({
          id: item.item_id || item.id || `temp-${Math.random()}`,
          type: item.item_type || 'ASSIGNMENT',
          title: item.item_name || '제목 없음',
          deadline: item.due_date,
          item_id: item.item_id,
          course_id: item.course_id,
          item_type: item.item_type,
          item_name: item.item_name,
          item_order: item.item_order,
          due_date: item.due_date,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        // 중복 항목 제거 (id 기준)
        const uniqueItems = Array.from(
          new Map(transformedItems.map(item => [item.id, item])).values()
        );
        
        console.log('변환 및 중복 제거 후 성적 항목:', uniqueItems);
        return uniqueItems;
      },
      providesTags: (_result, _error, courseId) => [{ type: 'GradeItems', id: courseId }]
    }),

    // 성적 항목에 파일 추가를 위한 업로드 URL 요청
    getGradeItemUploadUrls: builder.mutation<
      { urls: Array<{ fileName: string; sanitizedFileName: string; url: string; key: string }> },
      { itemId: string; files: Array<{ name: string; type: string; size: number }> }
    >({
      query: ({ itemId, files }) => ({
        url: `/admin/grades/items/${itemId}/upload-urls`,
        method: 'POST',
        body: { files }
      }),
      transformResponse: (response: ApiResponse<any>) => {
        console.log('성적 항목 파일 업로드 URL 응답:', response);
        if (!response.success || !response.data) {
          throw new Error(response.message || '업로드 URL 생성에 실패했습니다.');
        }
        return { urls: response.data.urls };
      }
    }),
    
    // 성적 항목 파일 목록 조회
    getGradeItemFiles: builder.query<
      Array<{ key: string; fileName: string; fileType: string; lastModified: string; size: number; isDownloadable: boolean }>,
      string
    >({
      query: (itemId) => `/admin/grades/items/${itemId}/files`,
      transformResponse: (response: ApiResponse<any>) => {
        console.log('성적 항목 파일 목록 응답:', response);
        if (!response.success || !response.data) {
          return [];
        }
        return response.data.files;
      },
      providesTags: (_result, _error, itemId) => [{ type: 'GradeItemFiles', id: itemId }]
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
  useToggleCourseStatusMutation,
  useUpdateMaterialPermissionMutation,
  useCreateTimemarkMutation,
  useGetTimemarksQuery,
  useUpdateTimemarkMutation,
  useDeleteTimemarkMutation,
  useGetAllNotesQuery,
  useCreateGradeItemMutation,
  useGetGradeItemsQuery,
  useGetGradeItemUploadUrlsMutation,
  useGetGradeItemFilesQuery,
} = courseApi; 