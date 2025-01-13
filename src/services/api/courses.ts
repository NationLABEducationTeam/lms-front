// Lambda URLs
const LIST_CATEGORIES_URL = 'https://yethqfg6s67dapbe7puvquhfpa0eadvb.lambda-url.ap-northeast-2.on.aws/';
const CREATE_COURSE_URL = 'https://jwhf5pie4ahdzfd6ce3ha4ddya0joopm.lambda-url.ap-northeast-2.on.aws/';
const UPLOAD_FILE_URL = 'https://taqgrjjwno2q62ymz5vqq3xcme0dqhqt.lambda-url.ap-northeast-2.on.aws/';
const GET_DOWNLOAD_URL = 'https://gabagm5wjii6gzeztxvf74cgbi0svoja.lambda-url.ap-northeast-2.on.aws/';
const DELETE_COURSE_URL = 'https://whym5n2vlkhep55o4j7i75znwa0dnipm.lambda-url.ap-northeast-2.on.aws/';
const UPDATE_COURSE_URL = 'https://krhl5cd3wy2ejzcrxiviier2tu0owccb.lambda-url.ap-northeast-2.on.aws/';
const GET_COURSE_DETAIL_URL = 'https://dwv5b4lus57dwmjsiqnmoyvgge0hmkwh.lambda-url.ap-northeast-2.on.aws/';  // TODO: 실제 URL로 교체 필요

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

// 카테고리 조회
export const listCategories = async (path: string = ''): Promise<ListResponse> => {
  try {
    const encodedPath = encodeURIComponent(path);
    const url = path ? `${LIST_CATEGORIES_URL}?path=${encodedPath}` : LIST_CATEGORIES_URL;
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
    // 경로에서 빈 문자열이나 undefined 제거 후 유효한 세그먼트만 결합
    const pathSegments = [mainCategory, subCategory].filter(segment => segment && segment.trim());
    const path = pathSegments.join('/');
    console.log('Fetching courses from path:', path);
    
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
    console.log('Received courses data:', data);
    
    // S3 폴더 구조를 Course 객체로 변환
    const courses: Course[] = await Promise.all(
      (data.folders || []).map(async (folder: S3Structure) => {
        try {
          const metaPath = `${path}/${folder.name}/meta.json`;
          console.log('Fetching metadata from:', metaPath);
          
          const metaResponse = await fetch(`${LIST_CATEGORIES_URL}?path=${metaPath}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!metaResponse.ok) {
            console.warn(`Failed to fetch metadata for course: ${folder.name}`);
            // 메타데이터가 없는 경우 기본값 사용
            return {
              id: folder.name,
              title: folder.name,
              description: '강의 설명이 없습니다.',
              mainCategory,
              subCategory,
              status: 'published' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          const metadata = await metaResponse.json();
          console.log('Received metadata:', metadata);
          
          return {
            id: folder.name,
            ...metadata,
            mainCategory,
            subCategory,
            status: metadata.status || 'published',
            createdAt: metadata.createdAt || new Date().toISOString(),
            updatedAt: metadata.updatedAt || new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error processing course ${folder.name}:`, error);
          // 에러가 발생한 경우에도 기본값 반환
          return {
            id: folder.name,
            title: folder.name,
            description: '강의 정보를 불러오는데 실패했습니다.',
            mainCategory,
            subCategory,
            status: 'published' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      })
    );

    console.log('Processed courses:', courses);
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

// 강의 상세 정보 조회
export const getCourseDetail = async (courseId: string): Promise<CourseDetail> => {
  try {
    const response = await fetch(`${GET_COURSE_DETAIL_URL}?courseId=${encodeURIComponent(courseId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch course details');
    }

    const data = await response.json();
    console.log('Received course details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
}; 