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

// 학생 성적 정보 인터페이스
export interface StudentGrades {
  courseId: string;
  courseName: string;
  totalScore?: number;
  gradeItems: {
    id: string;
    title: string;
    type: 'ASSIGNMENT' | 'ATTENDANCE' | 'EXAM';
    score?: number;
    maxScore?: number;
    dueDate?: string;
    submittedAt?: string;
    status: 'pending' | 'completed' | 'overdue';
  }[];
  attendanceRate?: number;
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

// 성적 API 응답 인터페이스
export interface StudentGradesResponse {
  success: boolean;
  message?: string;
  data: StudentGrades;
  error?: string;
}

// 새로운 과제 API 관련 인터페이스
export interface Assignment {
  item_id: string;
  item_type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM';
  title: string;
  due_date: string;
  course_id?: string;
  course_title: string;
  thumbnail_url?: string;
  score: number;
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
    
    // 학생 성적 조회 API
    getStudentGrades: builder.query<StudentGrades, string>({
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
            const mockGradeData: StudentGrades = {
              courseId: courseId,
              courseName: 'AWS SAP 2달 합격반',
              totalScore: 75,
              gradeItems: [
                {
                  id: '61',
                  title: 'EC2 생성 후 로드밸런싱 적용하기',
                  type: 'ASSIGNMENT',
                  maxScore: 100,
                  score: 85,
                  dueDate: '2025-03-19',
                  status: 'completed'
                },
                {
                  id: '62',
                  title: 'AWS 네트워크 기초 퀴즈',
                  type: 'EXAM', 
                  maxScore: 100,
                  score: 70,
                  dueDate: '2025-03-15',
                  status: 'completed'
                },
                {
                  id: '63',
                  title: '출석',
                  type: 'ATTENDANCE',
                  maxScore: 100,
                  score: 90,
                  status: 'completed'
                }
              ],
              attendanceRate: 90
            };
            return { data: mockGradeData };
          }
          
          // 응답이 성공인 경우
          const response = result.data as StudentGradesResponse;
          console.log('학생 성적 API 응답 데이터:', response);
          
          if (!response.success || !response.data) {
            console.error('성적 정보 조회 실패:', response.message || '데이터 없음');
            return { 
              data: {
                courseId: '',
                courseName: '',
                gradeItems: []
              }
            };
          }
          
          return { data: response.data };
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
          if (result.error) {
            console.error('과제 목록 조회 실패 (API 에러):', result.error);
            
            // 백엔드 API가 동작하지 않을 경우 모의 데이터 반환
            console.log('모의 데이터를 반환합니다.');
            const mockData = [
              {
                item_id: "1",
                item_type: "ASSIGNMENT",
                title: "EC2 생성 후 로드밸런싱 적용하기",
                due_date: new Date(Date.now() + 86400000).toISOString(), // 내일
                course_id: "1",
                course_title: "AWS SAP 2달 합격반",
                score: 0,
                is_completed: false,
                status: "진행중"
              },
              {
                item_id: "2",
                item_type: "QUIZ",
                title: "AWS 네트워크 기초 퀴즈",
                due_date: new Date(Date.now() + 172800000).toISOString(), // 이틀 후
                course_id: "1", 
                course_title: "AWS SAP 2달 합격반",
                score: 0,
                is_completed: false,
                status: "진행중"
              },
              {
                item_id: "3",
                item_type: "EXAM",
                title: "중간고사",
                due_date: new Date(Date.now() + 259200000).toISOString(), // 3일 후
                course_id: "1",
                course_title: "AWS SAP 2달 합격반", 
                score: 0,
                is_completed: false,
                status: "진행중"
              }
            ];
            return { data: mockData };
          }
          
          // 응답이 성공인 경우
          const response = result.data as { success: boolean; data: any; message?: string };
          console.log('과제 목록 API 응답 데이터:', response);
          
          if (!response.success || !response.data) {
            console.error('과제 목록 조회 실패 (응답 오류):', response.message || '데이터 없음');
            return { data: [] };
          }
          
          // 백엔드 응답 형식에 맞게 변환
          const assignments = Array.isArray(response.data) ? response.data : [];
          console.log(`${assignments.length}개의 과제/퀴즈 데이터를 받았습니다:`, assignments);
          return { data: assignments };
        } catch (error) {
          console.error('getAllAssignments API 호출 오류:', error);
          return { error: { status: 500, data: '과제 목록을 불러오는데 실패했습니다.' } };
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
    
    // 새로 추가: 과제 제출 API
    submitAssignment: builder.mutation<SubmitAssignmentResponse, {assignmentId: string; submissionData: SubmissionData}>({
      query: ({assignmentId, submissionData}) => ({
        url: `/assignments/${assignmentId}/submit`,
        method: 'POST',
        body: {
          submission_data: submissionData
        }
      }),
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