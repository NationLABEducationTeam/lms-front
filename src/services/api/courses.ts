import { S3Structure } from '@/types/s3';

const API_URL = 'https://ekxpoy4a6xma2zjpge5luykzbu0mtxcb.lambda-url.ap-northeast-2.on.aws';

export async function listMainCategories(): Promise<S3Structure[]> {
  try {
    const response = await fetch(`${API_URL}/folders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Main categories response:', data);
    return data.folders || [];
  } catch (error) {
    console.error('Error fetching main categories:', error);
    throw error;
  }
}

export async function listSubCategories(mainCategory: string): Promise<S3Structure[]> {
  try {
    const path = mainCategory.trim().replace('//', '/');
    const response = await fetch(`${API_URL}/folders?path=${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Sub categories response:', data);
    return data.folders || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
}

export async function listCoursesByCategory(mainCategory: string, subCategory: string): Promise<S3Structure[]> {
  try {
    const path = `${mainCategory.trim()}/${subCategory.trim()}/courses`.replace('//', '/');
    console.log('Fetching courses with path:', path);
    const response = await fetch(`${API_URL}/folders?path=${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Courses response:', data);
    return data.folders || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

export async function getCourseDetails(coursePath: string): Promise<{meta: any, weeks: S3Structure[]}> {
  try {
    const path = coursePath.trim().replace('//', '/');
    // 코스 메타데이터 가져오기
    const metaResponse = await fetch(`${API_URL}/files?path=${path}/meta.json`);
    if (!metaResponse.ok) {
      throw new Error(`HTTP error! status: ${metaResponse.status}`);
    }
    const metaData = await metaResponse.json();
    console.log('Course meta response:', metaData);
    const meta = JSON.parse(metaData.body);

    // 주차별 폴더 목록 가져오기
    const weeksResponse = await fetch(`${API_URL}/folders?path=${path}`);
    if (!weeksResponse.ok) {
      throw new Error(`HTTP error! status: ${weeksResponse.status}`);
    }
    const weeksData = await weeksResponse.json();
    console.log('Course weeks response:', weeksData);
    const weeks = (weeksData.folders || []).filter((folder: S3Structure) => 
      folder.type === 'directory' && folder.name.includes('주차')
    );

    return {
      meta,
      weeks
    };
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
} 