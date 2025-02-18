import { QnaPost, QnaFormData } from '@/types/qna';

const VIEW_API_URL = 'https://t5aqskvckoo2foa3enszyuijly0voqbl.lambda-url.ap-northeast-2.on.aws';
const UPLOAD_API_URL = 'https://dxbs7ctkbwmo2i55jozzmbxomy0mhtwi.lambda-url.ap-northeast-2.on.aws';


export const getQnaPosts = async (params?: { courseId?: string }): Promise<QnaPost[]> => {
  try {
    const url = new URL(`${VIEW_API_URL}/posts`);
    if (params?.courseId) {
      url.searchParams.append('courseId', params.courseId);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch QnA posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QnA posts:', error);
    throw error;
  }
};

export const getQnaPost = async (postId: string): Promise<QnaPost> => {
  try {
    const response = await fetch(`${VIEW_API_URL}/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch QnA post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QnA post:', error);
    throw error;
  }
};

export const createQnaPost = async (formData: QnaFormData): Promise<string> => {
  try {
    const response = await fetch(`${UPLOAD_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to create QnA post');
    }
    const data = await response.json();
    return data.postId;
  } catch (error) {
    console.error('Error creating QnA post:', error);
    throw error;
  }
};

export const updateQnaPost = async (postId: string, formData: Partial<QnaFormData>): Promise<void> => {
  try {
    const response = await fetch(`${UPLOAD_API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to update QnA post');
    }
  } catch (error) {
    console.error('Error updating QnA post:', error);
    throw error;
  }
};

export const deleteQnaPost = async (postId: string): Promise<void> => {
  try {
    const response = await fetch(`${UPLOAD_API_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete QnA post');
    }
  } catch (error) {
    console.error('Error deleting QnA post:', error);
    throw error;
  }
}; 