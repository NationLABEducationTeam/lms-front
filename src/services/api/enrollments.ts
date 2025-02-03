import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { fetchAuthSession } from '@aws-amplify/auth';

interface EnrollmentRequest {
  courseId: string;
  userId: string;
  enrolledAt: string;
}

export interface EnrolledCourse {
  course_id: string;
  course_title: string;
  enrollment_status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolled_at: string;
  progress_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  last_accessed_at: string;
  completion_date: string | null;
  main_category: string;
  sub_category: string;
}

export interface StudentEnrollment {
  cognito_user_id: string;
  student_name: string;
  student_email: string;
  enrolled_courses: EnrolledCourse[];
}

interface AdminEnrollmentResponse {
  success: boolean;
  data: {
    students: StudentEnrollment[];
    total: number;
  };
}

export const getAllEnrollments = async (): Promise<AdminEnrollmentResponse> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl('/courses/admin/enrollments/all'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '수강 목록을 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`수강 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('수강 목록을 불러오는 중 알 수 없는 오류가 발생했습니다.');
  }
};

export const enrollInCourse = async (data: EnrollmentRequest): Promise<any> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(API_ENDPOINTS.ENROLLMENTS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '수강신청에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`수강신청 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('수강신청 중 알 수 없는 오류가 발생했습니다.');
  }
}; 