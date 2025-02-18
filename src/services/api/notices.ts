import { Notice, NoticeFormData, NoticeApiResponse } from '@/types/notice';

const UPLOAD_API_URL = 'https://3iaqeer444ah2n6fmx2jy5gxqm0ynvoy.lambda-url.ap-northeast-2.on.aws';
const READ_API_URL = 'https://z7ogdxlcb4lyilfpim7l7nz5ti0rsccs.lambda-url.ap-northeast-2.on.aws'; // 조회용 Lambda URL을 여기에 입력하세요

export const createNotice = async (formData: NoticeFormData): Promise<string> => {
  try {
    // 1. Lambda 함수를 통해 presigned URL 받기
    const response = await fetch(`${UPLOAD_API_URL}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category || '일반',
        tags: formData.tags || [],
        isImportant: formData.isImportant || false,
        attachments: formData.attachments?.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) || []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create notice');
    }

    const data = await response.json() as NoticeApiResponse;
    const { noticeId, noticeUrl, attachmentUrls } = data;

    // 2. 첨부파일 업로드
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

    return noticeId;
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    throw error;
  }
};

export const getNotices = async (params?: { courseId?: string }): Promise<Notice[]> => {
  try {
    const url = new URL(`${READ_API_URL}/notices`);
    if (params?.courseId) {
      url.searchParams.append('courseId', params.courseId);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }

    const notices = await response.json();
    
    // 응답 데이터가 없거나 배열이 아닌 경우 빈 배열 반환
    if (!notices || !Array.isArray(notices)) {
      console.warn('공지사항 데이터가 없습니다.');
      return [];
    }

    // 유효한 데이터만 필터링
    return notices.filter(notice => notice && notice.metadata && notice.content);
  } catch (error) {
    console.error('공지사항 목록 조회 실패:', error);
    return [];
  }
};

export const getNotice = async (noticeId: string): Promise<Notice | null> => {
  try {
    const response = await fetch(`${READ_API_URL}/notices/${noticeId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('공지사항을 찾을 수 없습니다.');
        return null;
      }
      throw new Error('Failed to fetch notice');
    }

    const notice = await response.json();
    
    if (!notice || !notice.metadata || !notice.content) {
      console.warn('공지사항 데이터가 올바르지 않습니다.');
      return null;
    }

    return notice;
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    return null;
  }
};

export const deleteNotice = async (noticeId: string): Promise<void> => {
  try {
    const response = await fetch(`${UPLOAD_API_URL}/notices/${noticeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete notice');
    }
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    throw error;
  }
}; 