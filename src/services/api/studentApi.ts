import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import axios from 'axios';

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

// 새로운 성적 API 응답 구조에 맞는 타입 정의
export interface NewStudentGrades {
  course: {
    id?: string;
    title: string;
    image?: string;
    instructor?: string;
    period?: string;
    progress_rate?: number;
    total_score?: number;
    attendance_rate?: number;
    attendance_count?: number;
    total_attendance_count?: number;
    attendance_weight?: number;
    assignment_weight?: number;
    exam_weight?: number;
    weeks_count?: number;
    assignment_count?: number;
    exam_count?: number;
  };
  grades: {
    attendance?: {
      rate: number;
      score: number;
      sessions: any[];
      totalSessions: string;
    };
    attendance_score?: number;
    assignment_score?: number;
    exam_score?: number;
    attendance_completion_rate?: number;
    assignment_completion_rate?: number;
    exam_completion_rate?: number;
    progress_rate?: number;
    total_score?: number;
    assignments?: {
      id: string;
      title: string;
      type: string;
      score?: number;
      maxScore?: number;
      dueDate?: string;
      submittedAt?: string;
      status: string;
      isCompleted?: boolean;
    }[];
    exams?: {
      id: string;
      title: string;
      type: string;
      score?: number;
      maxScore?: number;
      dueDate?: string;
      submittedAt?: string;
      status: string;
      isCompleted?: boolean;
    }[];
  };
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

// 성적 API 응답 인터페이스 업데이트
export interface StudentGradesResponse {
  success: boolean;
  message?: string;
  data: NewStudentGrades;
  error?: string;
}

// 새로운 과제 API 관련 인터페이스
export interface Assignment {
  item_id: string | number;
  item_type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM';
  title: string;
  due_date: string;
  course_id: string;
  course_title: string;
  thumbnail_url?: string;
  score: string | number;
  is_completed: boolean;
  status: string;
  submission_data?: any;
  feedback?: string;
  submission_date?: string;
}

export interface AssignmentResponse {
  success: boolean;
  message?: string;
  data: Assignment[] | Assignment;
  error?: string;
}

export interface SubmissionData {
  content?: string;
  files?: { name: string; key: string; type: string; size: number }[];
  answers?: any; // 퀴즈 응답 데이터
  score?: number; // 퀴즈 점수 (0-100)
}

export interface SubmitAssignmentResponse {
  success: boolean;
  message?: string;
  data?: {
    grade_id: string;
    is_completed: boolean;
    score: number;
  };
  error?: string;
}

export interface UploadUrlResponse {
  success: boolean;
  data: {
    fileName: string;
    uploadUrl: string;
    fileKey: string;
  }[];
  error?: string;
}

// 빈 응답 객체 생성 함수
const createEmptyResponse = () => ({
  assignments: { pending: [], overdue: [], completed: [], total: 0 },
  exams: { pending: [], overdue: [], completed: [], total: 0 }
});

// Mock data for error fallback
export const emptyStudentGrades: NewStudentGrades = {
  course: {
    id: '1',
    title: '',
    image: '',
    instructor: '',
    period: '',
    progress_rate: 0,
    total_score: 0,
    attendance_rate: 0,
    attendance_count: 0,
    total_attendance_count: 0,
    assignment_count: 0,
    exam_count: 0,
    attendance_weight: 0,
    assignment_weight: 0,
    exam_weight: 0,
    weeks_count: 0
  },
  grades: {
    attendance_score: 0,
    assignment_score: 0,
    exam_score: 0,
    attendance_completion_rate: 0,
    assignment_completion_rate: 0,
    exam_completion_rate: 0,
    progress_rate: 0,
    total_score: 0,
    assignments: [],
    exams: []
  }
};

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StudentAssignments', 'StudentGrades', 'Assignment'],
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
    
    // 학생 성적 조회 API - 반환 타입 수정
    getStudentGrades: builder.query<NewStudentGrades, string>({
      queryFn: async (courseId, _api, _options, baseQuery) => {
        try {
          console.log('학생 성적 조회 시작 - API URL:', getApiUrl(`/courses/${courseId}/my-grades`));
          
          // 실제 API 호출
          const result = await baseQuery(`/courses/${courseId}/my-grades`);
          
          console.log('학생 성적 API 응답 원본:', result);
          
          // 에러가 있는 경우
          if (result.error) {
            console.error('성적 조회 실패 (API 에러):', result.error);
            
            // 성적 API가 동작하지 않을 경우 모의 데이터 반환
            console.log('모의 성적 데이터를 반환합니다.');
            // 새로운 구조에 맞는 모의 데이터
            const mockData: NewStudentGrades = {
              course: {
                title: 'AWS SAP 2달 합격반',
                attendance_weight: 20,
                assignment_weight: 50,
                exam_weight: 30,
                weeks_count: 8,
                assignment_count: 4,
                exam_count: 3
              },
              grades: {
                attendance: {
                  rate: 90,
                  score: 18,
                  sessions: [],
                  totalSessions: '8'
                },
                assignments: [
                  {
                    id: '61',
                    title: 'EC2 생성 후 로드밸런싱 적용하기',
                    type: 'ASSIGNMENT',
                    maxScore: 100,
                    score: 85,
                    dueDate: '2025-03-19',
                    status: 'completed'
                  }
                ],
                exams: [
                  {
                    id: '62',
                    title: 'AWS 네트워크 기초 퀴즈',
                    type: 'EXAM',
                    maxScore: 100,
                    score: 70,
                    dueDate: '2025-03-15',
                    status: 'completed'
                  }
                ],
                assignment_score: 42.5,
                exam_score: 21,
                assignment_completion_rate: 25,
                exam_completion_rate: 33,
                progress_rate: 28,
                total_score: 81.5
              }
            };
            return { data: mockData };
          }
          
          // 응답이 성공인 경우
          const response = result.data as StudentGradesResponse;
          console.log('학생 성적 API 응답 데이터:', response);
          
          if (!response.success || !response.data) {
            console.error('성적 정보 조회 실패:', response.message || '데이터 없음');
            // 기본 빈 데이터 구조 반환
            const emptyData: NewStudentGrades = {
              course: {
                title: '',
                attendance_weight: 0,
                assignment_weight: 0,
                exam_weight: 0,
                weeks_count: 0,
                assignment_count: 0,
                exam_count: 0
              },
              grades: {
                attendance: {
                  rate: 0,
                  score: 0,
                  sessions: [],
                  totalSessions: '0'
                },
                assignments: [],
                exams: [],
                assignment_score: 0,
                exam_score: 0,
                assignment_completion_rate: 0,
                exam_completion_rate: 0,
                progress_rate: 0,
                total_score: 0
              }
            };
            return { data: emptyData };
          }
          
          return { data: response.data as NewStudentGrades };
        } catch (error) {
          console.error('성적 조회 중 오류 발생:', error);
          return { error: { status: 500, data: '성적 정보를 불러오는데 실패했습니다.' } };
        }
      },
      providesTags: (result, error, courseId) => 
        result ? [{ type: 'StudentGrades', id: courseId }] : []
    }),
    
    // 새로 추가: 모든 과제/퀴즈 목록 조회
    getAllAssignments: builder.query<Assignment[], void>({
      queryFn: async (_arg, _api, _options, baseQuery) => {
        try {
          console.log('모든 과제 목록 API 요청 시작 - 전체 URL:', getApiUrl('/assignments/my'));
          
          // 실제 API 호출
          const result = await baseQuery('/assignments/my');
          
          console.log('getAllAssignments API 응답 원본:', result);
          
          // 에러가 있는 경우
          if ('error' in result) {
            console.error('과제 목록 조회 실패 (API 에러):', result.error);
            return { data: [] };
          }
          
          // API 응답을 적절한 타입으로 변환
          interface ApiResponse {
            success?: boolean;
            message?: string;
            data?: any;
          }
          
          const responseData = result.data as ApiResponse;
          
          if (!responseData) {
            console.error('과제 목록 조회 실패 (응답 오류): 응답 없음');
            return { data: [] };
          }
          
          // 백엔드 직접 응답인 경우 (응답 형식: data 프로퍼티 없이 바로 배열)
          if (Array.isArray(responseData)) {
            console.log(`${responseData.length}개의 과제/퀴즈 데이터를 받았습니다:`, responseData);
            return { data: responseData };
          }
          
          // 표준 API 응답 형식인 경우 (응답 형식: { success, data: [] })
          if (!responseData.data) {
            console.error('과제 목록 조회 실패 (응답 오류): 데이터 없음', responseData);
            return { data: [] };
          }
          
          // 데이터 배열 추출
          const assignments = Array.isArray(responseData.data) 
            ? responseData.data 
            : [];
          
          console.log(`${assignments.length}개의 과제/퀴즈 데이터를 받았습니다:`, assignments);
          return { data: assignments };
        } catch (error) {
          console.error('getAllAssignments API 호출 오류:', error);
          return { data: [] };
        }
      },
      providesTags: ['Assignment']
    }),
    
    // 새로 추가: 특정 과목의 과제/퀴즈 목록 조회
    getCourseAssignments: builder.query<Assignment[], string>({
      query: (courseId) => `/assignments/course/${courseId}`,
      transformResponse: (response: AssignmentResponse) => {
        console.log('과목별 과제 목록 API 응답:', response);
        
        if (!response.success || !response.data) {
          console.error('과목별 과제 목록 조회 실패:', response.message || '데이터 없음');
          return [];
        }
        
        return response.data as Assignment[];
      },
      providesTags: (result, error, courseId) => [{ type: 'Assignment', id: courseId }]
    }),
    
    // 새로 추가: 특정 과제/퀴즈 상세 정보 조회
    getAssignmentDetail: builder.query<Assignment, string>({
      query: (assignmentId) => `/assignments/${assignmentId}`,
      transformResponse: (response: AssignmentResponse) => {
        console.log('과제 상세 정보 API 응답:', response);
        
        if (!response.success || !response.data) {
          console.error('과제 상세 정보 조회 실패:', response.message || '데이터 없음');
          throw new Error('과제 상세 정보를 찾을 수 없습니다.');
        }
        
        return response.data as Assignment;
      },
      providesTags: (result, error, assignmentId) => [{ type: 'Assignment', id: assignmentId }]
    }),
    
    // 새로 추가: 과제 제출 API (퀴즈 점수 제출 지원)
    submitAssignment: builder.mutation<SubmitAssignmentResponse, {assignmentId: string; submissionData: SubmissionData}>({
      query: ({assignmentId, submissionData}) => {
        // 퀴즈인 경우 간단한 형식으로 점수만 전송
        const isQuiz = submissionData.score !== undefined;
        
        return {
          url: `/assignments/${assignmentId}/submit`,
          method: 'POST',
          body: isQuiz 
            ? { score: submissionData.score }  // 퀴즈: { score: 85 } 형식으로 전송
            : { submission_data: submissionData }  // 일반 과제: 기존 형식 유지
        };
      },
      transformResponse: (response: SubmitAssignmentResponse) => {
        console.log('제출 응답:', response);
        // grade_id 및 상태 업데이트 로깅
        if (response.success && response.data?.grade_id) {
          console.log(`저장 성공! Grade ID: ${response.data.grade_id}, 완료 상태: ${response.data.is_completed}, 점수: ${response.data.score}`);
        }
        return response;
      },
      invalidatesTags: (result, error, {assignmentId}) => [
        { type: 'Assignment', id: assignmentId },
        'Assignment',
        'StudentGrades'
      ]
    }),
    
    // 새로 추가: 과제 업로드 URL 요청 API
    getAssignmentUploadUrls: builder.mutation<UploadUrlResponse, {assignmentId: string; files: {name: string; type: string; size: number}[]}>({
      query: ({assignmentId, files}) => ({
        url: `/assignments/${assignmentId}/upload-urls`,
        method: 'POST',
        body: { files }
      })
    }),
    
    // 기존 과제 제출 API (기존 호환성 유지)
    submitAssignmentLegacy: builder.mutation<
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
      invalidatesTags: ['StudentAssignments', 'Assignment']
    })
  })
});

export const {
  useGetStudentAssignmentsQuery,
  useGetStudentGradesQuery,
  useGetAllAssignmentsQuery,
  useGetCourseAssignmentsQuery,
  useGetAssignmentDetailQuery,
  useSubmitAssignmentMutation,
  useGetAssignmentUploadUrlsMutation,
  useSubmitAssignmentLegacyMutation
} = studentApi;

export const getStudentGrades = async (courseId: string): Promise<NewStudentGrades> => {
  try {
    const response = await axios.get(getApiUrl(`/student/grade/${courseId}`));
    
    if (response.status === 200 && response.data) {
      // 실제 API 응답 데이터를 반환
      return response.data;
    } else {
      throw new Error('성적 정보 조회 실패');
    }
  } catch (error) {
    console.error('성적 정보 API 호출 실패:', error);
    
    // API 실패 시 빈 데이터 구조 반환
    const emptyResponse: NewStudentGrades = {
      course: {
        id: courseId || '',
        title: '',
        progress_rate: 0,
        total_score: 0,
        attendance_rate: 0,
        attendance_count: 0,
        total_attendance_count: 0,
        assignment_count: 0,
        exam_count: 0,
        attendance_weight: 0,
        assignment_weight: 0,
        exam_weight: 0,
        weeks_count: 0
      },
      grades: {
        attendance_score: 0,
        assignment_score: 0,
        exam_score: 0,
        attendance_completion_rate: 0,
        assignment_completion_rate: 0,
        exam_completion_rate: 0,
        progress_rate: 0,
        total_score: 0,
        assignments: [],
        exams: []
      }
    };
    
    return emptyResponse;
  }
}; 