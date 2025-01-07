import { Notice, NoticeFormData } from '@/types/notice';

// TODO: 실제 람다 함수 만든 후 변경
const API_URL = 'https://jbga5cl2emxbszroem4zw5pk6q0ejaee.lambda-url.ap-northeast-2.on.aws';

interface CreateNoticeResponse {
  noticeId: string;
  presignedUrls: { presignedUrl: string }[];
}

interface GetNoticesResponse {
  notices: Notice[];
}

export const createNotice = async (formData: NoticeFormData) => {
  try {
    // 1. Lambda 함수를 통해 predesigned URL 받기
    const response = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        files: formData.attachments?.map(file => ({
          name: file.name,
          type: file.type
        })) || []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create notice');
    }

    const data = await response.json() as CreateNoticeResponse;
    const { noticeId, presignedUrls } = data;

    // 2. predesigned URL을 사용하여 파일 업로드
    if (formData.attachments && presignedUrls) {
      await Promise.all(
        formData.attachments.map(async (file, index) => {
          const { presignedUrl } = presignedUrls[index];
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

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${API_URL}/notices`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }

    const data = await response.json() as GetNoticesResponse;
    return data.notices;
  } catch (error) {
    console.error('공지사항 목록 조회 실패:', error);
    throw error;
  }
}; 