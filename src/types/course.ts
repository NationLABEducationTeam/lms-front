export const CATEGORY_MAPPING = {
  'CLOUD': '클라우드',
  'AI_ML': '인공지능',
  'WEB': '웹 프로그래밍',
  'AUTOMATION': '자동화',
  'DEVOPS': '데브옵스',
  'DataEngineering': '데이터 엔지니어링',
  'CodeingTest': '코딩테스트'
} as const;

export type MainCategory = 'CLOUD' | 'SECURITY' | 'NETWORK' | 'DEVELOPMENT';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  instructor_image?: string;
  instructor_bio?: string;
  main_category_id: string;
  main_category_name: string;
  sub_category_id: string;
  sub_category_name: string;
  thumbnail_url?: string;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface CourseFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export interface WeeklyContent {
  weekNumber: string;
  name: string;
  files: {
    name: string;
    path: string;
    size: number;
    lastModified?: string;
    type: string;
  }[];
}

export interface CourseInfo {
  title: string;
  description: string;
  instructor: string;
  totalWeeks: number;
}

export interface CourseDetail {
  weeklyContents: WeeklyContent[];
  courseInfo: CourseInfo;
}

export interface DynamoCourse {
  id: string;
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  instructor: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  thumbnail?: string;
  duration?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface CourseListResponse {
  Items: DynamoCourse[];
  Count: number;
  ScannedCount: number;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content?: string;
}

interface FAQ {
  question: string;
  answer: string;
}