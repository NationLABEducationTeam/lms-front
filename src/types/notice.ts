export interface NoticeMetadata {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive';
  viewCount: number;
  isImportant: boolean;
}

export interface NoticeContent {
  title: string;
  content: string;
}

export interface Notice {
  metadata: NoticeMetadata;
  content: NoticeContent;
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }[];
}

// 공지사항 작성 시 필요한 폼 데이터 타입
export interface NoticeFormData {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  isImportant?: boolean;
  attachments?: File[];
}

// 공지사항 카테고리 타입
export type NoticeCategory = 
  | '일반'
  | '학사'
  | '장학'
  | '취업'
  | '행사'
  | '기타';

// 공지사항 상태 타입
export type NoticeStatus = 'active' | 'inactive';

// 공지사항 API 응답 타입
export interface NoticeApiResponse {
  noticeId: string;
  noticeUrl: string;
  attachmentUrls: {
    presignedUrl: string;
    key: string;
  }[];
} 