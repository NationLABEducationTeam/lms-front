export const CATEGORY_MAPPING = {
  'CLOUD': '클라우드',
  'AI_ML': '인공지능',
  'WEB': '웹 프로그래밍',
  'AUTOMATION': '자동화',
  'DEVOPS': '데브옵스',
  'DataEngineering': '데이터 엔지니어링',
  'CodeingTest': '코딩테스트'
} as const;

export type MainCategoryId = keyof typeof CATEGORY_MAPPING;

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE'
}

export interface MainCategory {
  id: MainCategoryId;
  name: string;
  sub_categories: {
    id: string;
    name: string;
  }[];
}

export type CourseType = 'ONLINE' | 'VOD';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  instructor_image?: string;
  instructor_bio?: string;
  main_category_id: MainCategoryId;
  main_category_name: string;
  sub_category_id: string;
  sub_category_name: string;
  thumbnail_url?: string;
  zoom_link?: string;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  type: CourseType;
  classmode: 'ONLINE' | 'VOD';
  created_at: string;
  updated_at: string;
  weeks?: Week[];
  enrolled_count?: number;
}

export interface CourseFile {
  id: string;
  course_id: string;
  week_number: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyContent {
  week_number: number;
  title: string;
  description?: string;
  files: CourseFile[];
}

export interface CourseDetail extends Course {
  weekly_contents: WeeklyContent[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MainCategoryInfo extends Category {}

export interface SubCategory extends Category {
  main_category_id: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: EnrollmentStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';

export interface CourseInfo {
  title: string;
  description: string;
  instructor: string;
  totalWeeks: number;
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

export interface WeekMaterial {
  fileName: string;
  downloadUrl: string;
  lastModified: string;
  size: number;
}

export interface Week {
  weekNumber: number;
  materials: {
    [key: string]: WeekMaterial[];
  };
}