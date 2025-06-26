import { createApi } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '@/config/api';
import { baseQueryWithReauth } from '@/services/api/baseQuery';

// API 응답 래퍼 타입
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// 설문 질문 타입
export interface ReviewQuestion {
  id?: string;
  text: string;
  type: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE';
  options?: { value: string }[];
}

// 설문 템플릿 타입
export interface ReviewTemplate {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  targetRespondents?: number;
  questions: ReviewQuestion[];
  createdAt: string;
  updatedAt: string;
}

// 설문 템플릿 생성/수정 요청 타입
export interface ReviewTemplateCreateRequest {
  title: string;
  description?: string;
  courseId?: string;
  targetRespondents?: number;
  questions: ReviewQuestion[];
}

export interface ReviewTemplateUpdateRequest {
  title: string;
  description?: string;
  courseId?: string;
  targetRespondents?: number;
  questions: ReviewQuestion[];
}

// 설문 응답 타입
export interface ReviewResponse {
  id: string;
  reviewTemplateId: string;
  userId?: string;
  userName?: string;
  answers: { questionId: string; answer: string }[];
  submittedAt: string;
}

// 설문 응답 제출 요청 타입
export interface ReviewResponseSubmitRequest {
  reviewTemplateId: string;
  userName?: string;
  answers: { questionId: string; answer: string }[];
}

// 설문 API
export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReviewTemplate', 'ReviewResponse', 'ReviewTemplateList'],
  endpoints: (builder) => ({
    // 1. 설문 템플릿 목록 조회
    getReviewTemplates: builder.query<ReviewTemplate[], void>({
      query: () => getApiUrl('/admin/reviews/templates'),
      transformResponse: (response: ApiResponse<ReviewTemplate[]>) => {
        if (!response.success || !response.data) {
          console.error('설문 템플릿 목록 조회 실패:', response.message);
          throw new Error(response.message || '설문 템플릿 목록을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: ['ReviewTemplateList'],
    }),

    // 2. 설문 템플릿 상세 조회
    getReviewTemplate: builder.query<ReviewTemplate, string>({
      query: (id) => getApiUrl(`/admin/reviews/templates/${id}`),
      transformResponse: (response: ApiResponse<ReviewTemplate>) => {
        if (!response.success || !response.data) {
          console.error('설문 템플릿 상세 조회 실패:', response.message);
          throw new Error(response.message || '설문 템플릿을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: 'ReviewTemplate', id }],
    }),

    // 2-1. (Public) 설문 템플릿 상세 조회 (학생용)
    getPublicReviewTemplate: builder.query<ReviewTemplate, string>({
      query: (id) => getApiUrl(`/admin/reviews/templates/${id}`),
      transformResponse: (response: ApiResponse<ReviewTemplate>) => {
        if (!response.success || !response.data) {
          console.error('공개 설문 템플릿 상세 조회 실패:', response.message);
          throw new Error(response.message || '설문 템플릿을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, id) => [{ type: 'ReviewTemplate', id }],
    }),

    // 3. 설문 템플릿 생성
    createReviewTemplate: builder.mutation<ReviewTemplate, ReviewTemplateCreateRequest>({
      query: (templateData) => ({
        url: getApiUrl('/admin/reviews/templates'),
        method: 'POST',
        body: templateData,
      }),
      transformResponse: (response: ApiResponse<ReviewTemplate>) => {
        if (!response.success || !response.data) {
          console.error('설문 템플릿 생성 실패:', response.message);
          throw new Error(response.message || '설문 템플릿 생성에 실패했습니다.');
        }
        return response.data;
      },
      invalidatesTags: ['ReviewTemplateList'],
    }),

    // 4. 설문 템플릿 수정
    updateReviewTemplate: builder.mutation<ReviewTemplate, { id: string; data: ReviewTemplateUpdateRequest }>({
      query: ({ id, data }) => ({
        url: getApiUrl(`/admin/reviews/templates/${id}`),
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ReviewTemplate>) => {
        if (!response.success || !response.data) {
          console.error('설문 템플릿 수정 실패:', response.message);
          throw new Error(response.message || '설문 템플릿 수정에 실패했습니다.');
        }
        return response.data;
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ReviewTemplate', id },
        'ReviewTemplateList',
      ],
    }),

    // 5. 설문 템플릿 삭제
    deleteReviewTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: getApiUrl(`/admin/reviews/templates/${id}`),
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => {
        if (!response.success) {
          console.error('설문 템플릿 삭제 실패:', response.message);
          throw new Error(response.message || '설문 템플릿 삭제에 실패했습니다.');
        }
        return response.data;
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'ReviewTemplate', id },
        'ReviewTemplateList',
      ],
    }),

    // 6. 설문 응답 제출
    submitReviewResponse: builder.mutation<ReviewResponse, ReviewResponseSubmitRequest>({
      query: (responseData) => ({
        url: getApiUrl('/admin/reviews/responses'),
        method: 'POST',
        body: responseData,
      }),
      transformResponse: (response: ApiResponse<ReviewResponse>) => {
        if (!response.success || !response.data) {
          console.error('설문 응답 제출 실패:', response.message);
          throw new Error(response.message || '설문 응답 제출에 실패했습니다.');
        }
        return response.data;
      },
      invalidatesTags: (_result, _error, { reviewTemplateId }) => [
        { type: 'ReviewResponse', id: reviewTemplateId },
      ],
    }),

    // 7. 특정 설문 템플릿의 응답 목록 조회
    getReviewResponses: builder.query<ReviewResponse[], string>({
      query: (reviewTemplateId) => getApiUrl(`/admin/reviews/responses/${reviewTemplateId}`),
      transformResponse: (response: ApiResponse<ReviewResponse[]>) => {
        if (!response.success || !response.data) {
          console.error('설문 응답 목록 조회 실패:', response.message);
          throw new Error(response.message || '설문 응답 목록을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, reviewTemplateId) => [
        { type: 'ReviewResponse', id: reviewTemplateId },
      ],
    }),

    // 8. 모든 설문 응답 조회 (관리자용)
    getAllReviewResponses: builder.query<ReviewResponse[], void>({
      query: () => getApiUrl('/admin/reviews/responses'),
      transformResponse: (response: ApiResponse<ReviewResponse[]>) => {
        if (!response.success || !response.data) {
          console.error('전체 설문 응답 조회 실패:', response.message);
          throw new Error(response.message || '설문 응답을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: ['ReviewResponse'],
    }),
  }),
});

// 훅 내보내기
export const {
  useGetReviewTemplatesQuery,
  useGetReviewTemplateQuery,
  useGetPublicReviewTemplateQuery,
  useCreateReviewTemplateMutation,
  useUpdateReviewTemplateMutation,
  useDeleteReviewTemplateMutation,
  useSubmitReviewResponseMutation,
  useGetReviewResponsesQuery,
  useGetAllReviewResponsesQuery,
} = reviewApi; 