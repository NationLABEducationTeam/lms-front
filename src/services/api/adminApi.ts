import { createApi } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '@/config/api';
import { baseQueryWithReauth } from '@/services/api/baseQuery';

// 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// 과제 아이템 인터페이스
export interface AssignmentItem {
  item_id: string;
  item_type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ';
  item_name: string;
  due_date: string;
  item_order: number;
  course_title: string;
  total_students: number;
  total_submissions: number;
  completed_submissions: number;
  average_score: number;
  min_score: number;
  max_score: number;
}

// 학생 제출물 인터페이스
export interface StudentSubmission {
  student_id: string;
  student_name: string;
  student_email: string;
  enrollment_id: string;
  grade_id: string;
  score: number | null;
  is_completed: boolean;
  submission_date: string | null;
  has_submitted: boolean;
  is_late: boolean;
  has_feedback: boolean;
  file_count: number;
}

// 과제 정보 인터페이스
export interface AssignmentInfo {
  item_id: string;
  item_type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ';
  item_name: string;
  due_date: string;
  course_id: string;
  course_title: string;
  item_order: number;
}

// 제출 상세 인터페이스
export interface SubmissionDetail {
  grade_id: string;
  enrollment_id: string;
  item_id: string;
  score: number | null;
  is_completed: boolean;
  submission_date: string | null;
  submission_data: {
    comment?: string;
    files?: {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileKey: string;
      uploadDate: string;
    }[];
  };
  feedback?: string;
  created_at: string;
  updated_at: string;
  assignment_name: string;
  item_type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ';
  due_date: string;
  course_id: string;
  course_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  is_late: boolean;
  has_submitted: boolean;
  files: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileKey: string;
    uploadDate: string;
  }[];
}

// 파일 다운로드 URL 응답 인터페이스
export interface DownloadUrlResponse {
  downloadUrl: string;
  fileKey: string;
}

// 채점 요청 인터페이스
export interface GradeRequest {
  score: number;
  feedback?: string;
  modified_by?: string;
}

// 과제 상세 페이지 응답 인터페이스
export interface AssignmentSubmissionsResponse {
  assignment: AssignmentInfo;
  submissions: StudentSubmission[];
}

// 관리자 API 생성
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Assignment', 'Submission', 'SubmissionDetail'],
  endpoints: (builder) => ({
    // 1. 특정 과목의 모든 과제 목록 조회
    getCourseAssignments: builder.query<AssignmentItem[], string>({
      query: (courseId) => getApiUrl(`/admin/assignments/course/${courseId}`),
      transformResponse: (response: ApiResponse<AssignmentItem[]>) => {
        if (!response.success || !response.data) {
          console.error('과제 목록 조회 실패:', response.message);
          throw new Error(response.message || '과제 목록을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, courseId) => [
        { type: 'Assignment', id: courseId }
      ]
    }),

    // 2. 특정 과제의 모든 학생 제출 현황 조회
    getAssignmentSubmissions: builder.query<AssignmentSubmissionsResponse, string>({
      query: (assignmentId) => getApiUrl(`/admin/assignments/${assignmentId}/submissions`),
      transformResponse: (response: ApiResponse<AssignmentSubmissionsResponse>) => {
        if (!response.success || !response.data) {
          console.error('제출 현황 조회 실패:', response.message);
          throw new Error(response.message || '과제 제출 현황을 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, assignmentId) => [
        { type: 'Submission', id: assignmentId }
      ]
    }),

    // 3. 특정 학생의 특정 과제 제출물 상세 조회
    getSubmissionDetail: builder.query<SubmissionDetail, string>({
      query: (submissionId) => getApiUrl(`/admin/assignments/submission/${submissionId}`),
      transformResponse: (response: ApiResponse<SubmissionDetail>) => {
        if (!response.success || !response.data) {
          console.error('제출물 상세 조회 실패:', response.message);
          throw new Error(response.message || '제출물 상세 정보를 불러오는데 실패했습니다.');
        }
        return response.data;
      },
      providesTags: (_result, _error, submissionId) => [
        { type: 'SubmissionDetail', id: submissionId }
      ]
    }),

    // 4. 제출된 파일 다운로드 URL 생성
    getFileDownloadUrl: builder.query<DownloadUrlResponse, string>({
      query: (fileKey) => getApiUrl(`/admin/assignments/file/${fileKey}/download-url`),
      transformResponse: (response: ApiResponse<DownloadUrlResponse>) => {
        if (!response.success || !response.data) {
          console.error('다운로드 URL 생성 실패:', response.message);
          throw new Error(response.message || '다운로드 URL 생성에 실패했습니다.');
        }
        return response.data;
      }
    }),

    // 5. 과제 채점 및 피드백 제공
    gradeSubmission: builder.mutation<SubmissionDetail, { submissionId: string; data: GradeRequest }>({
      query: ({ submissionId, data }) => ({
        url: getApiUrl(`/admin/assignments/submission/${submissionId}/grade`),
        method: 'PUT',
        body: data
      }),
      transformResponse: (response: ApiResponse<SubmissionDetail>) => {
        if (!response.success || !response.data) {
          console.error('채점 실패:', response.message);
          throw new Error(response.message || '채점에 실패했습니다.');
        }
        return response.data;
      },
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'SubmissionDetail', id: submissionId }
      ]
    }),
  }),
}); 