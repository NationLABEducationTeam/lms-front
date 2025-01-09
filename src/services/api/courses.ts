// Lambda URLs
const LIST_CATEGORIES_URL = 'https://yethqfg6s67dapbe7puvquhfpa0eadvb.lambda-url.ap-northeast-2.on.aws/';
const CREATE_COURSE_URL = 'https://jwhf5pie4ahdzfd6ce3ha4ddya0joopm.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';
const DELETE_COURSE_URL = 'https://whym5n2vlkhep55o4j7i75znwa0dnipm.lambda-url.ap-northeast-2.on.aws/';
const UPDATE_COURSE_URL = 'https://krhl5cd3wy2ejzcrxiviier2tu0owccb.lambda-url.ap-northeast-2.on.aws/';

import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Course } from '@/types/course';
import { S3Structure } from '@/types/s3';

interface ListResponse {
  folders: S3Structure[];
  files: S3Structure[];
}

interface CoursesResponse {
  courses: Course[];
}

// 카테고리 조회
export const listCategories = async (path: string = ''): Promise<ListResponse> => {
  try {
    const url = path ? `${LIST_CATEGORIES_URL}?path=${path}` : LIST_CATEGORIES_URL;
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
    const path = `${mainCategory}/${subCategory}/courses`;
    const response = await fetch(`${LIST_CATEGORIES_URL}?path=${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    const data = await response.json();
    
    // S3 폴더 구조를 Course 객체로 변환
    const courses: Course[] = await Promise.all(
      data.folders.map(async (folder: S3Structure) => {
        const metaResponse = await fetch(`${LIST_CATEGORIES_URL}?path=${folder.path}/meta.json`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!metaResponse.ok) {
          throw new Error('Failed to fetch course metadata');
        }
        const metadata = await metaResponse.json();
        return {
          id: folder.name,
          ...metadata,
          mainCategory,
          subCategory
        };
      })
    );

    return { courses };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// 강의 생성
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ courseId: string }> => {
  try {
    console.log('Fetching auth session...');
    const session = await fetchAuthSession();
    console.log('Full auth session:', {
      hasTokens: !!session.tokens,
      idToken: {
        exists: !!session.tokens?.idToken,
        payload: session.tokens?.idToken?.payload,
      },
      accessToken: {
        exists: !!session.tokens?.accessToken,
        payload: session.tokens?.accessToken?.payload,
      }
    });

    // Access 토큰 사용
    const token = session.tokens?.accessToken?.toString();
    console.log('Access Token exists:', !!token);
    
    const user = await getCurrentUser();
    console.log('Current user:', {
      username: user.username,
      userId: user.userId,
      signInDetails: user.signInDetails,
    });
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 사용자 권한 확인 (Access 토큰의 cognito:groups 확인)
    const groups = session.tokens?.accessToken?.payload['cognito:groups'];
    console.log('User groups:', groups);
    
    if (!Array.isArray(groups) || !groups.includes('ADMIN')) {
      throw new Error('관리자 권한이 필요합니다.');
    }

    console.log('Request details:', {
      url: CREATE_COURSE_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      },
      body: {
        ...courseData,
        instructor: user.username,
        debug: true
      }
    });

    const response = await fetch(CREATE_COURSE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        ...courseData,
        instructor: user.username,
        debug: true
      })
    });

    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to create course');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating course:', {
      error,
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : 'Unknown error message',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
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
export const deleteCourse = async (courseId: string, path: string): Promise<void> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(DELETE_COURSE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId, path })
    });
    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
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