// Lambda URLs
const LIST_STUDENT_COURSES_URL = 'https://ixnk2hrpzmae6rn7xa6dgox57a0fofid.lambda-url.ap-northeast-2.on.aws/';
const CREATE_COURSE_URL = 'https://jwhf5pie4ahdzfd6ce3ha4ddya0joopm.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';
const DELETE_COURSE_URL = 'https://whym5n2vlkhep55o4j7i75znwa0dnipm.lambda-url.ap-northeast-2.on.aws/';
const UPDATE_COURSE_URL = 'https://krhl5cd3wy2ejzcrxiviier2tu0owccb.lambda-url.ap-northeast-2.on.aws/';
const GET_COURSE_DETAIL_URL = 'https://dwv5b4lus57dwmjsiqnmoyvgge0hmkwh.lambda-url.ap-northeast-2.on.aws/';

const API_URL = import.meta.env.VITE_API_URL;

import { getApiUrl } from '@/config/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';
import { DynamoCourse, CourseListResponse, MainCategory } from '@/types/course';
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
}

// 카테고리 조회
export const listCategories = async (path: string = ''): Promise<ListResponse> => {
  try {
    const encodedPath = encodeURIComponent(path);
    const url = path ? `${LIST_STUDENT_COURSES_URL}?path=${encodedPath}` : LIST_STUDENT_COURSES_URL;
    console.log('Fetching from URL:', url);
    
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
    console.log('Received data:', data);
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
    const response = await fetch(`${API_URL}/courses?mainCategory=${mainCategory}&subCategory=${subCategory}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    const data = await response.json();
    console.log('Received courses data:', data);

    return { courses: data.courses };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// 강의 생성
export const createCourse = async (params: CreateCourseParams) => {
  try {
    const { title, description, mainCategory, subCategory, instructor, thumbnail } = params;

    // Cognito 세션 확인
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

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
    const response = await axios.post<{ courseId: string; message: string }>(
      CREATE_COURSE_URL,
      {
        title,
        description,
        mainCategory,
        subCategory,
        instructor,
        thumbnail: thumbnailBase64
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      courseId: response.data.courseId,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
};

// 파일 업로드를 위한 presigned URL 요청
export const getUploadUrls = async (path: string, files: { name: string; type: string; size: number }[]): Promise<{ urls: string[] }> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(UPLOAD_FILE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path, files })
    });
    if (!response.ok) {
      throw new Error('Failed to get upload URLs');
    }
    return await response.json();
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
    
    const response = await fetch(`${DELETE_COURSE_URL}?courseId=${courseId}`, {
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

    const response = await fetch(UPDATE_COURSE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId, ...updateData })
    });
    if (!response.ok) {
      throw new Error('Failed to update course');
    }
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// 강의 상세 정보 조회
export const getCourseDetail = async (courseId: string): Promise<Course> => {
  try {
    const response = await fetch(`${GET_COURSE_DETAIL_URL}?courseId=${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    const data = await response.json();
    console.log('Received course data:', data);
    
    if (!data || !data.Item) {
      throw new Error('Course not found');
    }

    return data.Item;
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
    console.log('Received course details:', data);

    // 강의 정보가 없는 경우 에러 처리
    if (!data.courses || data.courses.length === 0) {
      throw new Error('Course not found');
    }

    // 첫 번째 강의 정보 사용 (API가 이미 courseId로 필터링된 결과를 반환)
    const course = data.courses[0];

    // 폴더 구조를 weeklyContents로 변환
    const weeklyContents = data.folders.map((folder: any) => {
      console.log('Processing folder:', folder);
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

    console.log('Final courseDetail:', courseDetail);
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
    console.log('Received courses and categories:', data);
    
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
    console.log('Fetching contents from path:', path);
    
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
    console.log('Received contents:', data);
    return {
      folders: data.folders || [],
      files: data.files || []
    };
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
}; 


export const listPublicCourses = async (): Promise<DynamoCourse[]> => {
  try {
    console.log('Fetching courses from:', API_URL);
    const response = await axios.get(`${API_URL}/`);
    
    console.log('Response data:', response.data);

    if (!response.data || !response.data.Items) {
      throw new Error('Invalid response format');
    }

    return response.data.Items.filter((course: DynamoCourse) => course.status === 'published');
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}; 

// 모든 강의 목록 조회 (관리자용)
export const listAllCourses = async (): Promise<CoursesResponse> => {
  try {
    console.log('Fetching courses from:', API_URL);
    const response = await axios.get(`${API_URL}/`);
    
    console.log('Response data:', response.data);

    if (!response.data || !response.data.Items) {
      throw new Error('Invalid response format');
    }

    return { courses: response.data.Items };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}; 

export const getEnrolledCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses`, {
      withCredentials: true
    });

    if (!response.data) {
      throw new Error('Failed to fetch enrolled courses');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
}; 