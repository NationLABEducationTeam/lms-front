import { QnaPost, QnaFormData } from '@/types/qna';

const API_URL = 'https://your-qna-api-endpoint.com';

export const getQnaPosts = async (): Promise<QnaPost[]> => {
  try {
    const response = await fetch(`${API_URL}/posts`);
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
    const response = await fetch(`${API_URL}/posts/${postId}`);
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
    const response = await fetch(`${API_URL}/posts`, {
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
    const response = await fetch(`${API_URL}/posts/${postId}`, {
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
    const response = await fetch(`${API_URL}/posts/${postId}`, {
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