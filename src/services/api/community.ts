import { CommunityPost, CommunityFormData, CommunityApiResponse } from '@/types/community';

const VIEW_API_URL = 'https://u5ngqeh2bw7rsr7go7rmauhwzu0zkdvx.lambda-url.ap-northeast-2.on.aws';
const UPLOAD_API_URL = 'https://cjop6rpsi33t4d3vijmh7viqjy0xeadk.lambda-url.ap-northeast-2.on.aws';

export const createCommunityPost = async (formData: CommunityFormData): Promise<string> => {
  try {
    const response = await fetch(`${UPLOAD_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        author: formData.author,
        attachments: formData.attachments?.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) || []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create community post');
    }

    const data = await response.json() as CommunityApiResponse;
    const { postId, postUrl, attachmentUrls } = data;

    // 첨부파일 업로드
    if (formData.attachments && attachmentUrls) {
      await Promise.all(
        formData.attachments.map(async (file, index) => {
          const { presignedUrl } = attachmentUrls[index];
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
        })
      );
    }

    return postId;
  } catch (error) {
    console.error('자유게시판 글 작성 실패:', error);
    throw error;
  }
};

export const getCommunityPosts = async (params?: { courseId?: string }): Promise<CommunityPost[]> => {
  try {
    const url = new URL(`${VIEW_API_URL}/posts`);
    if (params?.courseId) {
      url.searchParams.append('courseId', params.courseId);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch community posts');
    }

    const posts = await response.json();
    
    // 응답 데이터가 없을 경우 빈 배열 반환
    if (!posts || !Array.isArray(posts)) {
      console.warn('게시글 데이터가 없습니다.');
      return [];
    }

    return posts;
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
};

export const getCommunityPost = async (postId: string): Promise<CommunityPost | null> => {
  try {
    const response = await fetch(`${VIEW_API_URL}/posts/${postId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch community post');
    }

    const post = await response.json();
    
    if (!post) {
      console.warn('게시글을 찾을 수 없습니다.');
      return null;
    }

    return post;
  } catch (error) {
    console.error('게시글 조회 실패:', error);
    return null;
  }
}; 