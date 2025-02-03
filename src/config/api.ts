// config/environment.ts

type Environment = 'development' | 'staging' | 'production';

interface ApiConfig {
  baseUrl: string;
  prefix: string;
}

const API_CONFIGS: Record<Environment, ApiConfig> = {
  development: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    prefix: '/api/v1'
  },
  staging: {
    baseUrl: 'http://lms-alb-599601140.ap-northeast-2.elb.amazonaws.com',
    prefix: '/api/v1'
  },
  production: {
    baseUrl: 'http://lms-alb-599601140.ap-northeast-2.elb.amazonaws.com',
    prefix: '/api/v1'
  }
};

// 현재 환경 가져오기
const getCurrentEnvironment = (): Environment => {
  return (import.meta.env.VITE_ENV as Environment) || 'development';
};

// API URL 생성
export const getApiConfig = () => API_CONFIGS[getCurrentEnvironment()];

export const getApiUrl = (endpoint: string) => {
  const config = getApiConfig();
  return `${config.baseUrl}${config.prefix}${endpoint}`;
};

// API 엔드포인트
export const API_ENDPOINTS = {
  COURSES: '/courses',
  COURSE_DETAIL: (courseId: string) => `/courses/${courseId}`,
  NOTICES: '/notices',
  COMMUNITY: '/community',
  QNA: '/qna',
  STUDENT_DASHBOARD: '/dashboard/student',
  USERS: '/users',
  ENROLLMENTS: '/enrollments'
} as const;