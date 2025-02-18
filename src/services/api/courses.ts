// Lambda URLs
const LIST_STUDENT_COURSES_URL = 'https://ixnk2hrpzmae6rn7xa6dgox57a0fofid.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';


import { getApiUrl, API_ENDPOINTS } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Course, MainCategory, CourseLevel } from '@/types/course';
import { S3Structure } from '@/types/s3';
import axios from 'axios';

interface ListResponse {
  folders: S3Structure[];
  files: S3Structure[];
}

interface CoursesResponse {
  courses: Course[];
}

interface CourseDetail {
  weeklyContents: {
    weekNumber: string;
    name: string;
    files: {
      name: string;
      path: string;
      size: number;
      lastModified?: string;
      type: string;
    }[];
  }[];
  courseInfo: {
    title: string;
    description: string;
    instructor: string;
    totalWeeks: number;
  };
}

interface CreateCourseParams {
  title: string;
  description: string;
  mainCategory: MainCategory;
  subCategory: string;
  instructor: string;
  thumbnail?: File;
  level: CourseLevel;
  price: number;
}

interface PresignedUrlResponse {
  fileName: string;
  url: string;
  key: string;
}

// 카테고리 조회
export const listCategories = async (path: string = ''): Promise<ListResponse> => {
  try {
    const encodedPath = encodeURIComponent(path);
    const url = path ? `${LIST_STUDENT_COURSES_URL}?path=${encodedPath}` : LIST_STUDENT_COURSES_URL;
    // console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch categories');
    }
    
    const data = await response.json();
    // console.log('Received data:', data);
    return {
      folders: data.folders || [],
      files: data.files || []
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// 강의 목록 조회
export const listCourses = async (mainCategory: string, subCategory: string): Promise<CoursesResponse> => {
  try {
    const response = await fetch(`${getApiUrl(API_ENDPOINTS.COURSES)}?mainCategory=${mainCategory}&subCategory=${subCategory}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '강의 목록을 불러오는데 실패했습니다.');
    }

    return { courses: data.data.courses };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// 강의 생성
export const createCourse = async (params: CreateCourseParams) => {
  try {
    const { title, description, mainCategory, subCategory, instructor, thumbnail, level, price } = params;

    // Cognito 세션 확인
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    // Cognito 사용자 ID 가져오기
    const currentUser = await getCurrentUser();
    const instructorId = currentUser.userId;

    // Base64로 변환
    let thumbnailBase64 = null;
    if (thumbnail) {
      const reader = new FileReader();
      thumbnailBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(thumbnail);
      });
    }

    // API 호출
    const response = await axios.post(
      getApiUrl(API_ENDPOINTS.COURSES),
      {
        title,
        description,
        instructor_id: instructorId,
        main_category_id: mainCategory,
        sub_category_id: subCategory,
        thumbnail_url: thumbnailBase64,
        price,
        level
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '강의 생성에 실패했습니다.');
    }

    return {
      courseId: response.data.data.course.id,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
};

// 파일 업로드를 위한 presigned URL 요청
export const getUploadUrls = async (
  courseId: string, 
  weekNumber: number, 
  files: { name: string; type: string; size: number }[]
): Promise<{ urls: PresignedUrlResponse[] }> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(getApiUrl(`/admin/courses/${courseId}/${weekNumber}/upload`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ files })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get upload URLs');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to get upload URLs');
    }

    return { urls: data.data.urls };
  } catch (error) {
    console.error('Error getting upload URLs:', error);
    throw error;
  }
};

// 파일 다운로드 URL 요청
export const getDownloadUrl = async (path: string): Promise<{ presignedUrl: string }> => {
  try {
    const response = await fetch(`${GET_DOWNLOAD_URL}?path=${path}`);
    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

// 강의 삭제
export const deleteCourse = async (courseId: string) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    const response = await fetch(`${getApiUrl('/admin/courses')}/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// 강의 정보 수정
export const updateCourse = async (courseId: string, updateData: Partial<Course>): Promise<void> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${getApiUrl(API_ENDPOINTS.COURSES)}/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '강의 정보 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// 강의 상세 정보 조회
export const getCourseDetail = async (courseId: string): Promise<Course> => {
  try {
    const { data } = await axios.get(`${getApiUrl(API_ENDPOINTS.COURSES)}/public/${courseId}`);
    
    if (!data.success) {
      throw new Error(data.message || '강의 정보를 불러오는데 실패했습니다.');
    }

    return data.data.course;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// 강의 상세 정보 조회
export const getCourseById = async (courseId: string): Promise<CourseDetail> => {
  try {
    const response = await fetch(`${LIST_STUDENT_COURSES_URL}?courseId=${encodeURIComponent(courseId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    const data = await response.json();
    // console.log('Received course details:', data);

    // 강의 정보가 없는 경우 에러 처리
    if (!data.courses || data.courses.length === 0) {
      throw new Error('Course not found');
    }

    // 첫 번째 강의 정보 사용 (API가 이미 courseId로 필터링된 결과를 반환)
    const course = data.courses[0];

    // 폴더 구조를 weeklyContents로 변환
    const weeklyContents = data.folders.map((folder: any) => {
      // console.log('Processing folder:', folder);
      return {
        weekNumber: folder.name,
        name: folder.name,
        files: folder.files || []
      };
    });

    // CourseDetail 형식으로 변환
    const courseDetail: CourseDetail = {
      courseInfo: {
        title: course.title || '제목 없음',
        description: course.description || '설명 없음',
        instructor: course.instructor || '강사 정보 없음',
        totalWeeks: weeklyContents.length
      },
      weeklyContents
    };

    // console.log('Final courseDetail:', courseDetail);
    return courseDetail;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// 카테고리와 강의 목록 한 번에 조회
export const listAllCoursesAndCategories = async (): Promise<{
  courses: Course[];
  categories: {
    name: string;
    path: string;
    type: string;
    subCategories: {
      [key: string]: {
        name: string;
        path: string;
        type: string;
        courses: Course[];
      }
    }
  }[];
}> => {
  try {
    const response = await fetch(LIST_STUDENT_COURSES_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses and categories');
    }
    
    const data = await response.json();
    // console.log('Received courses and categories:', data);
    
    return {
      courses: data.courses || [],
      categories: data.categories || []
    };
  } catch (error) {
    console.error('Error fetching courses and categories:', error);
    throw error;
  }
};

// 특정 경로의 컨텐츠만 조회 (기존 listCategories 함수 수정)
export const listPathContents = async (path: string): Promise<ListResponse> => {
  try {
    const url = LIST_STUDENT_COURSES_URL;
    // console.log('Fetching contents from path:', path);
    
    const response = await fetch(`${url}?path=${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch contents');
    }
    
    const data = await response.json();
    // console.log('Received contents:', data);
    return {
      folders: data.folders || [],
      files: data.files || []
    };
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
}; 

export const listPublicCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.PUBLIC_COURSES), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '강의 목록을 불러오는데 실패했습니다.');
    }

    const responseData = await response.json();
    
    if (!responseData.success || !responseData.data?.courses) {
      console.error('Unexpected response format:', responseData);
      return [];
    }

    // API 응답 데이터를 Course 타입에 맞게 매핑
    return responseData.data.courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor_id: course.instructor_id,
      instructor_name: course.instructor_name,
      main_category_id: course.main_category_id,
      sub_category_id: course.sub_category_id,
      thumbnail_url: course.thumbnail_url,
      price: parseFloat(course.price),
      level: course.level,
      status: course.status,
      classmode: course.classmode,
      created_at: course.created_at,
      updated_at: course.updated_at
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}; 

// 수강 중인 강의 목록 조회
export const getEnrolledCourses = async (): Promise<CoursesResponse> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    const currentUser = await getCurrentUser();
    const userId = currentUser.userId;
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(getApiUrl(`${API_ENDPOINTS.COURSES}/enrolled/${userId}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '수강 목록을 불러오는데 실패했습니다.');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '수강 목록을 불러오는데 실패했습니다.');
    }
    
    return { courses: data.data.courses };
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
}; 

// 관리자용 강의 상세 정보 조회 (주차별 자료 포함)
export const getAdminCourseDetail = async (courseId: string): Promise<{
  course: Course;
  weeks: {
    weekName: string;
    weekNumber: number;
    materials: {
      [key: string]: {
        fileName: string;
        downloadUrl: string;
        lastModified: string;
        size: number;
      }[];
    };
  }[];
}> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${getApiUrl(API_ENDPOINTS.COURSES)}/${courseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '강의 정보를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '강의 정보를 불러오는데 실패했습니다.');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching admin course details:', error);
    throw error;
  }
}; 