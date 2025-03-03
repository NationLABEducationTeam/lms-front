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

export interface GradeRules {
  attendance_weight: number;  // 출석 반영 비율
  assignment_weight: number;  // 과제 반영 비율
  exam_weight: number;       // 시험 반영 비율
  min_attendance_rate: number; // 최소 출석률
}

export interface GradeItem {
  id: string;
  type: 'ASSIGNMENT' | 'ATTENDANCE' | 'EXAM';
  title: string;
  max_score: number;
  weight: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  instructor_image?: string;
  instructor_bio?: string;
  main_category_id: string;
  sub_category_id: string;
  thumbnail_url?: string;
  zoom_link?: string;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  type: CourseType;
  classmode: 'ONLINE' | 'VOD';
  gradeRules?: GradeRules;  // 성적 산출 규칙
  grade_items?: GradeItem[];  // 성적 항목들
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
  streamingUrl?: string;
  lastModified: string;
  size: number;
  downloadable?: boolean;
  type?: string;
  isHlsFile?: boolean;
}

export interface Quiz {
  quizTitle: string;
  description: string;
  questions: QuizQuestion[];
  metadata: {
    totalQuestions: number;
    timeLimit: number;
    passingScore: number;
    version: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple';
  choices: string[];
  correctAnswer: number | number[];
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  answers: {
    questionId: number;
    answer: number | number[];
  }[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
}

export interface Week {
  weekNumber: number;
  materials: {
    [key: string]: WeekMaterial[];
  };
}

export interface Timemark {
  id: string;
  courseId: string;
  videoId: string;
  userId: string;
  timestamp: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isSaved: boolean;
  isEdited: boolean;
}

export interface TimemarkResponse {
  success: boolean;
  message: string;
  data: Timemark;
}

export interface TimemarkListResponse {
  success: boolean;
  message: string;
  data: Timemark[];
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

export interface CourseListResponse {
  success: boolean;
  message: string;
  data: Course[];
}

export interface Note {
  id: string;
  timestamp: number;
  formattedTime: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  courseId: string;
  videoId: string;
}

export interface VideoNotes {
  videoId: string;
  videoTitle: string;
  weekNumber: number;
  weekTitle?: string;
  noteCount: number;
  notes: Note[];
}

export interface WeekNotes {
  weekNumber: number;
  videos: VideoNotes[];
}

export interface CourseNotes {
  courseId: string;
  courseTitle: string;
  totalNotes: number;
  videoCount: number;
  lastUpdated: string;
  preview?: {
    content: string;
    formattedTime: string;
    videoId: string;
  };
  videos: VideoNotes[];
}

export interface CourseNotesResponse {
  success: boolean;
  data: CourseNotes[];
}