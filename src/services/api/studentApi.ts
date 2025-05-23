import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import axios from 'axios';

// 과제 및 시험 항목 인터페이스
export interface AssignmentItem {
  id?: string;
  item_id?: string;
  item_type?: 'ASSIGNMENT' | 'EXAM';
  item_name?: string;
  course_id: string;
  course_title: string;
  title?: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  score?: number;
  max_score?: number;
  submission_date?: string;
  feedback?: string;
  week_number?: number;
  type?: 'ASSIGNMENT' | 'EXAM';
  is_completed?: boolean;
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

// 학생 정보 인터페이스
interface Student {
  cognito_user_id: string;
  student_name: string;
  student_email: string;
  enrolled_courses: Array<{
    course_id: string | null;
    course_title: string | null;
    enrollment_status: string | null;
    enrolled_at: string | null;
    progress_status: string | null;
    last_accessed_at: string | null;
    completion_date: string | null;
    main_category_id: string | null;
    sub_category_id: string | null;
  }>;
}

// API 응답 인터페이스
interface StudentsResponse {
  success: boolean;
  data: {
    students: Student[];
    total: number;
  };
}

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StudentAssignments', 'StudentGrades', 'Assignment', 'Students'],
  // 전역 캐싱 설정 - 10분간 캐시 유지
  keepUnusedDataFor: 600,
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
      keepUnusedDataFor: 300, // 5분간 캐시 유지
      providesTags: ['StudentAssignments']
    }),
    
    // 학생 성적 조회 API - 캐싱 최적화
    getStudentGrades: builder.query<NewStudentGrades, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/my-grades`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('RTK Query 성적 API 응답:', response);
        
        // 백엔드 응답 구조: { success: true, data: {...} }
        if (response.success && response.data) {
          console.log('RTK Query 성적 실제 데이터:', response.data);
          return response.data;
        }
        
        // 응답 구조가 다를 경우 그대로 반환
        return response;
      },
      keepUnusedDataFor: 300, // 5분간 캐시 유지
      providesTags: (_result, _error, courseId) => [{ type: 'StudentGrades', id: courseId }],
    }),
    
    // 모든 과제/퀴즈 목록 조회 - 캐싱 최적화
    getAllAssignments: builder.query<Assignment[], void>({
      queryFn: async (_arg, _api, _options, baseQuery) => {
        try {
          // 현재 로그인한 사용자의 ID 가져오기
          const currentUser = await getCurrentUser();
          const studentId = currentUser.userId;
          
          // API 요청 실행 - students 라우터 사용
          const result = await baseQuery(`/students/${studentId}/assignments`);
          
          if (result.error) {
            console.error('과제 목록 조회 실패:', result.error);
            return { error: result.error };
          }
          
          const response = result.data as StudentAssignmentsResponse;
          console.log('학생 과제 API 응답:', response);
          
          if (!response.success || !response.data) {
            console.error('과제 목록 조회 실패:', response.message);
            return { data: [] };
          }
          
          // assignments와 exams를 합쳐서 Assignment[] 형태로 변환
          const allAssignments: Assignment[] = [
            ...response.data.assignments.pending,
            ...response.data.assignments.overdue, 
            ...response.data.assignments.completed,
            ...response.data.exams.pending,
            ...response.data.exams.overdue,
            ...response.data.exams.completed
          ].map(item => ({
            item_id: item.item_id || item.id || '',
            item_type: item.item_type || item.type || 'ASSIGNMENT',
            title: item.item_name || item.title || '',
            due_date: item.due_date,
            course_id: item.course_id,
            course_title: item.course_title,
            score: item.score || 0,
            is_completed: item.is_completed || false,
            status: item.status || '진행중'
          } as Assignment));
          
          return { data: allAssignments };
        } catch (error) {
          console.error('과제 목록 조회 중 오류 발생:', error);
          return { 
            error: { 
              status: 500, 
              data: error instanceof Error ? error.message : '과제 목록을 불러오는데 실패했습니다.'
            } as FetchBaseQueryError
          };
        }
      },
      keepUnusedDataFor: 300, // 5분간 캐시 유지
      providesTags: ['Assignment'],
    }),
    
    // 특정 과목의 과제/퀴즈 목록 조회 - 캐싱 최적화
    getCourseAssignments: builder.query<Assignment[], string>({
      queryFn: async (courseId, _api, _options, baseQuery) => {
        try {
          // 현재 로그인한 사용자의 ID 가져오기
          const currentUser = await getCurrentUser();
          const studentId = currentUser.userId;
          
          // 전체 과제 목록을 가져온 후 courseId로 필터링
          const result = await baseQuery(`/students/${studentId}/assignments`);
          
          if (result.error) {
            console.error('과제 목록 조회 실패:', result.error);
            return { error: result.error };
          }
          
          const response = result.data as StudentAssignmentsResponse;
          
          if (!response.success || !response.data) {
            console.error('과제 목록 조회 실패:', response.message);
            return { data: [] };
          }
          
          // assignments와 exams를 합쳐서 특정 courseId만 필터링
          const courseAssignments: Assignment[] = [
            ...response.data.assignments.pending,
            ...response.data.assignments.overdue, 
            ...response.data.assignments.completed,
            ...response.data.exams.pending,
            ...response.data.exams.overdue,
            ...response.data.exams.completed
          ]
          .filter(item => item.course_id === courseId) // courseId로 필터링
          .map(item => ({
            item_id: item.item_id || item.id || '',
            item_type: item.item_type || item.type || 'ASSIGNMENT',
            title: item.item_name || item.title || '',
            due_date: item.due_date,
            course_id: item.course_id,
            course_title: item.course_title,
            score: item.score || 0,
            is_completed: item.is_completed || false,
            status: item.status || '진행중'
          } as Assignment));
          
          return { data: courseAssignments };
        } catch (error) {
          console.error('특정 과목 과제 목록 조회 중 오류 발생:', error);
          return { 
            error: { 
              status: 500, 
              data: error instanceof Error ? error.message : '과제 목록을 불러오는데 실패했습니다.'
            } as FetchBaseQueryError
          };
        }
      },
      keepUnusedDataFor: 300, // 5분간 캐시 유지
      providesTags: (_result, _error, courseId) => [{ type: 'Assignment', id: courseId }],
    }),
    
    // 특정 과제/퀴즈 상세 정보 조회 - 캐싱 최적화
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
      keepUnusedDataFor: 600, // 10분간 캐시 유지 (상세 정보는 더 오래 캐시)
      providesTags: (_result, _error, assignmentId) => [{ type: 'Assignment', id: assignmentId }]
    }),
    
    // 과제 제출 API (퀴즈 점수 제출 지원) - 캐시 무효화 최적화
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
      // 제출 후 관련 캐시 무효화 - 선택적 무효화로 성능 개선
      invalidatesTags: (_result, _error, {assignmentId}) => [
        { type: 'Assignment', id: assignmentId },
        'Assignment', // 전체 과제 목록도 갱신
        'StudentGrades', // 성적 정보도 갱신
        'StudentAssignments' // 과제 목록도 갱신
      ]
    }),
    
    // 과제 업로드 URL 요청 API - 캐싱 불필요
    getAssignmentUploadUrls: builder.mutation<UploadUrlResponse, {assignmentId: string; files: {name: string; type: string; size: number}[]}>({
      query: ({assignmentId, files}) => ({
        url: `/assignments/${assignmentId}/upload-urls`,
        method: 'POST',
        body: { files }
      })
    }),
    
    // 기존 과제 제출 API (기존 호환성 유지) - 캐시 무효화 최적화
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
      // 제출 후 관련 캐시 무효화
      invalidatesTags: ['StudentAssignments', 'Assignment', 'StudentGrades']
    }),

    // 학생 목록 조회 - 캐싱 최적화
    getStudents: builder.query<StudentsResponse, void>({
      query: () => '/admin/students',
      keepUnusedDataFor: 600, // 10분간 캐시 유지
      providesTags: ['Students']
    }),
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
  useSubmitAssignmentLegacyMutation,
  useGetStudentsQuery
} = studentApi;

export const getStudentGrades = async (courseId: string): Promise<NewStudentGrades> => {
  try {
    const response = await axios.get(getApiUrl(`/courses/${courseId}/my-grades`), {
      headers: {
        Authorization: `Bearer ${(await fetchAuthSession()).tokens?.idToken?.toString()}`
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log('성적 API 전체 응답:', response.data);
      
      // 백엔드 응답 구조: { success: true, data: {...} }
      if (response.data.success && response.data.data) {
        const gradeData = response.data.data;
        console.log('성적 실제 데이터:', gradeData);
        
        // API 응답 데이터 전처리: exam_count가 0이면 exams 배열을 비우고 관련 점수를 0으로 설정
        const processedData = {...gradeData} as NewStudentGrades;
        if (processedData.course && processedData.course.exam_count === 0) {
          if (processedData.grades) {
            processedData.grades.exams = [];
            processedData.grades.exam_score = 0;
            processedData.grades.exam_completion_rate = 0;
          }
        }
        
        console.log('처리된 성적 데이터:', processedData);
        return processedData;
      } else {
        console.error('API 응답 구조가 예상과 다름:', response.data);
        throw new Error('성적 정보 응답 구조가 올바르지 않습니다.');
      }
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