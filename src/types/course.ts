export type CourseStatus = 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';

export interface CourseMetadata {
  id: string;
  name: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  category: string;
  subcategory: string;
  thumbnail?: string;
  startDate?: string;
  endDate?: string;
  totalWeeks: number;
  enrolledStudents: number;
  status: CourseStatus;
}

export interface CourseStatusConfig {
  status: CourseStatus;
  label: string;
  color: string;
  action: {
    text: string;
    icon: string;
    handler?: () => void;
  };
}

export interface WeeklySession {
  weekNum: number;
  title: string;
  description?: string;
  status: CourseStatus;
  startDate?: string;
  endDate?: string;
  zoomLink?: string;
  recordingUrl?: string;
  materials?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  attendees?: number;
}

export const COURSE_STATUS_CONFIG: Record<CourseStatus, Omit<CourseStatusConfig, 'action'>> = {
  COMPLETED: {
    status: 'COMPLETED',
    label: '수업 완료',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  IN_PROGRESS: {
    status: 'IN_PROGRESS',
    label: '진행중',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  SCHEDULED: {
    status: 'SCHEDULED',
    label: '수업 예정',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}; 