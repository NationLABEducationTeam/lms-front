export type CourseStatus = 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';

export interface CourseStatusConfig {
  status: string;
  color: string;
  action: {
    text: string;
    icon: string;
    handler?: () => void;
  };
}

export interface Course {
  course_id: string;
  name: string;
  title: string;
  description: string;
  path: string;
  lastModified?: string;
  zoom_link?: string;
  instructor_id?: string;
  thumbnail_url?: string;
  engtitle: string;
}

export interface Session {
  sessionId: string;
  title: string;
  description?: string;
  weekNum: number;
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
    status: '수업 완료',
    color: 'bg-green-100 text-green-800 dark:bg-green-50 dark:text-green-700'
  },
  IN_PROGRESS: {
    status: '진행중',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-50 dark:text-blue-700'
  },
  SCHEDULED: {
    status: '수업 예정',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-50 dark:text-gray-700'
  }
}; 