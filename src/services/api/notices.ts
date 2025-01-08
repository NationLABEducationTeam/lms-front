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

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${READ_API_URL}/notices`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }

    const notices = await response.json();
    
    // 응답 데이터가 없을 경우 빈 배열 반환
    if (!notices || !Array.isArray(notices)) {
      console.warn('공지사항 데이터가 없습니다.');
      return [];
    }

    // 각 공지사항에 대해 필요한 기본값 설정
    return notices.map(notice => {
      if (!notice.metadata) {
        notice.metadata = {
          id: notice.id || 'unknown',
          author: '알 수 없음',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: '일반',
          tags: [],
          status: 'active',
          viewCount: 0,
          isImportant: false
        };
      } else {
        if (notice.metadata.isImportant === undefined) {
          notice.metadata.isImportant = false;
        }
        if (!notice.metadata.tags) {
          notice.metadata.tags = [];
        }
      }

      if (!notice.content) {
        notice.content = {
          title: '제목 없음',
          body: '',
          summary: ''
        };
      }

      if (!notice.attachments) {
        notice.attachments = [];
      }

      return notice;
    });
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
    
    if (!notice) {
      console.warn('공지사항을 찾을 수 없습니다.');
      return null;
    }

    // metadata가 없는 경우 기본값 설정
    if (!notice.metadata) {
      notice.metadata = {
        id: noticeId,
        author: '알 수 없음',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: '일반',
        tags: [],
        status: 'active',
        viewCount: 0,
        isImportant: false
      };
    } else {
      // metadata는 있지만 isImportant가 없는 경우
      if (notice.metadata.isImportant === undefined) {
        notice.metadata.isImportant = false;
      }
      // tags가 없는 경우
      if (!notice.metadata.tags) {
        notice.metadata.tags = [];
      }
    }

    // content가 없는 경우 기본값 설정
    if (!notice.content) {
      notice.content = {
        title: '제목 없음',
        body: '',
        summary: ''
      };
    }

    // attachments가 없는 경우 기본값 설정
    if (!notice.attachments) {
      notice.attachments = [];
    }

    return notice;
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    return null;
  }
}; 