export interface CommunityPost {
  metadata: {
    id: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    commentCount: number;
  };
  content: {
    title: string;
    body: string;
    summary?: string;
  };
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }[];
}

// 게시글 작성 시 필요한 폼 데이터 타입
export interface CommunityFormData {
  title: string;
  content: string;
  summary?: string;
  author: string;
  attachments?: File[];
}

// API 응답 타입
export interface CommunityApiResponse {
  postId: string;
  postUrl: string;
  attachmentUrls: {
    presignedUrl: string;
    key: string;
  }[];
} 