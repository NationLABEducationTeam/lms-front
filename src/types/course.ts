export const CATEGORY_MAPPING = {
  'CLOUD': '클라우드',
  'AI_ML': '인공지능',
  'WEB': '웹 프로그래밍',
  'AUTOMATION': '자동화',
  'DEVOPS': '데브옵스',
  'DataEngineering': '데이터 엔지니어링',
  'CodeingTest': '코딩테스트'
} as const;

export type MainCategory = keyof typeof CATEGORY_MAPPING;

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  mainCategory: MainCategory;
  subCategory: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  totalWeeks?: number;
  thumbnail?: string;
  price?: number;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CourseFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export interface WeeklyContent {
  weekNumber: number;
  folderName: string;
  files: CourseFile[];
}

export interface CourseDetail extends Course {
  weeklyContents: WeeklyContent[];
  thumbnail?: string;
  materials?: CourseFile[];
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
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CourseListResponse {
  Items: DynamoCourse[];
  Count: number;
  ScannedCount: number;
}