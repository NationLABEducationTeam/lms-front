import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// 과제 및 시험 항목 인터페이스
export interface AssignmentItem {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  score?: number;
  max_score?: number;
  submission_date?: string;
  feedback?: string;
  week_number: number;
  type: 'ASSIGNMENT' | 'EXAM';
}

// API 응답 인터페이스
export interface StudentAssignmentsResponse {
  success: boolean;
  message?: string;
  data: {
    assignments: {
      pending: AssignmentItem[];
      overdue: AssignmentItem[];
      completed: AssignmentItem[];
      total: number;
    };
    exams: {
      pending: AssignmentItem[];
      overdue: AssignmentItem[];
      completed: AssignmentItem[];
      total: number;
    };
  };
  error?: string;
}

// 빈 응답 객체 생성 함수
const createEmptyResponse = () => ({
  assignments: { pending: [], overdue: [], completed: [], total: 0 },
  exams: { pending: [], overdue: [], completed: [], total: 0 }
});

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StudentAssignments'],
  endpoints: (builder) => ({
    // 학생의 과제 및 시험 목록 조회
    getStudentAssignments: builder.query<StudentAssignmentsResponse['data'], void>({
      queryFn: async (_arg, _api, _options, baseQuery) => {
        try {
          // 현재 로그인한 사용자의 ID 가져오기
          const currentUser = await getCurrentUser();
          const studentId = currentUser.userId;
          
          // API 요청 실행
          const result = await baseQuery(`/students/${studentId}/assignments`);
          
          if (result.error) {
            console.error('과제 및 시험 목록 조회 실패:', result.error);
            return { error: result.error };
          }
          
          const response = result.data as StudentAssignmentsResponse;
          console.log('학생 과제 및 시험 API 응답:', response);
          
          // 응답이 성공이 아니거나 데이터가 없는 경우 빈 객체 반환
          if (!response.success || !response.data) {
            console.error('과제 및 시험 목록 조회 실패:', response.message || response.error);
            return { data: createEmptyResponse() };
          }
          
          return { data: response.data };
        } catch (error) {
          console.error('과제 및 시험 목록 조회 중 오류 발생:', error);
          return { 
            error: { 
              status: 500, 
              data: error instanceof Error ? error.message : '과제 및 시험 목록을 불러오는데 실패했습니다.',
              error: '과제 및 시험 목록을 불러오는데 실패했습니다.'
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['StudentAssignments']
    }),
    
    // 과제 제출 API (필요시 구현)
    submitAssignment: builder.mutation<
      { success: boolean; message: string }, 
      { assignmentId: string; files?: File[]; content?: string }
    >({
      queryFn: async (arg, _api, _options, baseQuery) => {
        try {
          const { assignmentId, files, content } = arg;
          
          // 현재 로그인한 사용자의 ID 가져오기
          const currentUser = await getCurrentUser();
          const studentId = currentUser.userId;
          
          const formData = new FormData();
          if (content) formData.append('content', content);
          if (files) {
            files.forEach(file => formData.append('files', file));
          }
          
          // API 요청 실행
          const result = await baseQuery({
            url: `/students/${studentId}/assignments/${assignmentId}/submit`,
            method: 'POST',
            body: formData
          });
          
          if (result.error) {
            console.error('과제 제출 실패:', result.error);
            return { error: result.error };
          }
          
          return { data: result.data as { success: boolean; message: string } };
        } catch (error) {
          console.error('과제 제출 중 오류 발생:', error);
          return { 
            error: { 
              status: 500, 
              data: error instanceof Error ? error.message : '과제 제출에 실패했습니다.',
              error: '과제 제출에 실패했습니다.'
            } as FetchBaseQueryError
          };
        }
      },
      invalidatesTags: ['StudentAssignments']
    })
  })
});

export const {
  useGetStudentAssignmentsQuery,
  useSubmitAssignmentMutation
} = studentApi; 