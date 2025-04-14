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

// 수강생 상태 관리 인터페이스
export interface CourseEnrollmentItem {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'ACTIVE' | 'DROPPED';
  student_name: string;
  student_email: string;
  progress_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  last_accessed_at: string;
}

// 상태 변경 요청 인터페이스
export interface UpdateEnrollmentStatusRequest {
  status: 'ACTIVE' | 'DROPPED';
  reason?: string;
}

// 특정 학생의 수강 정보
export interface StudentEnrollmentsDetail {
  student: {
    name: string;
    email: string;
    role: string;
  };
  enrollments: {
    id: string;
    course_id: string;
    student_id: string;
    enrolled_at: string;
    status: 'ACTIVE' | 'DROPPED';
    course_title: string;
    course_description: string;
    progress_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    last_accessed_at: string;
  }[];
  total: number;
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

// 특정 과목의 모든 수강생 조회
export const getCourseEnrollments = async (courseId: string): Promise<{
  success: boolean;
  data: {
    enrollments: CourseEnrollmentItem[];
    total: number;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/course/${courseId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '수강생 목록을 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`수강생 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('수강생 목록을 불러오는 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 수강생 상태 변경
export const updateEnrollmentStatus = async (
  enrollmentId: string, 
  data: UpdateEnrollmentStatusRequest
): Promise<{
  success: boolean;
  message: string;
  data: {
    enrollment: CourseEnrollmentItem;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/${enrollmentId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '수강생 상태 변경에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`수강생 상태 변경 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('수강생 상태 변경 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 정지된 수강생 목록 조회
export const getSuspendedEnrollments = async (): Promise<{
  success: boolean;
  data: {
    enrollments: CourseEnrollmentItem[];
    total: number;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl('/admin/enrollments/suspended'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '정지된 수강생 목록을 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`정지된 수강생 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('정지된 수강생 목록을 불러오는 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 특정 학생의 모든 수강 정보 조회
export const getStudentEnrollments = async (studentId: string): Promise<{
  success: boolean;
  data: StudentEnrollmentsDetail;
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/student/${studentId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '학생 수강 정보를 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`학생 수강 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('학생 수강 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 학생 노트 인터페이스
export interface StudentNote {
  id: string;
  student_id: string;
  admin_id: string;
  content: string;
  course_id?: string;
  created_at: string;
  updated_at: string;
  admin?: {
    name: string;
    email: string;
  };
}

// 특정 학생의 모든 노트 조회
export const getStudentNotes = async (studentId: string): Promise<{
  success: boolean;
  data: {
    notes: StudentNote[];
    total: number;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/students/${studentId}/notes`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '학생 노트를 불러오는데 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`학생 노트를 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('학생 노트를 불러오는 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 학생 노트 추가
export const addStudentNote = async (
  studentId: string, 
  data: { content: string; course_id?: string }
): Promise<{
  success: boolean;
  message: string;
  data: {
    note: StudentNote;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/students/${studentId}/notes`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '학생 노트 추가에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`학생 노트 추가 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('학생 노트 추가 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 학생 노트 수정
export const updateStudentNote = async (
  studentId: string,
  noteId: string,
  data: { content: string }
): Promise<{
  success: boolean;
  message: string;
  data: {
    note: StudentNote;
  };
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/students/${studentId}/notes/${noteId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '학생 노트 수정에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`학생 노트 수정 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('학생 노트 수정 중 알 수 없는 오류가 발생했습니다.');
  }
};

// 학생 노트 삭제
export const deleteStudentNote = async (
  studentId: string,
  noteId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(getApiUrl(`/admin/enrollments/students/${studentId}/notes/${noteId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '학생 노트 삭제에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`학생 노트 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error('학생 노트 삭제 중 알 수 없는 오류가 발생했습니다.');
  }
}; 