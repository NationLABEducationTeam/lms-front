export const MAIN_CATEGORIES = {
  AI_ML: '인공지능/머신러닝',
  CLOUD: '클라우드',
  PROGRAMMING: '프로그래밍',
  DATA: '데이터',
  SECURITY: '보안'
} as const;

export const SUB_CATEGORIES = {
  AI_ML: {
    DEEP_LEARNING: '딥러닝',
    MACHINE_LEARNING: '머신러닝',
    NLP: '자연어처리'
  },
  CLOUD: {
    AWS_BASIC: 'AWS 입문',
    AWS_SAA: 'AWS 솔루션스 아키텍트 어소시에이트',
    AWS_SAP: 'AWS 솔루션스 아키텍트 프로페셔널'
  },
  PROGRAMMING: {
    PYTHON: '파이썬',
    JAVA: '자바',
    JAVASCRIPT: '자바스크립트'
  },
  DATA: {
    SQL: 'SQL 기초',
    DATA_ANALYSIS: '데이터 분석',
    BIG_DATA: '빅데이터'
  },
  SECURITY: {
    SECURITY_BASIC: '보안 기초',
    PENETRATION: '모의해킹',
    CLOUD_SECURITY: '클라우드 보안'
  }
} as const;

export type MainCategory = keyof typeof MAIN_CATEGORIES;
export type SubCategory = keyof typeof SUB_CATEGORIES[MainCategory];

export interface Course {
  id: string;
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface CourseContent {
  id: string;
  courseId: string;
  week: number;
  title: string;
  description: string;
  type: 'lecture' | 'quiz' | 'assignment';
  content: any;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    role: string;
  };
}

export interface CoursePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUploadContent: boolean;
  canCreateQuiz: boolean;
  canGrade: boolean;
  canEnroll: boolean;
}

export interface CourseFormData {
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  thumbnail?: File;
  materials?: File[];
}