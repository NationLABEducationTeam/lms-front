export interface CommunityMetadata {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  category: string;
  tags: string[];
}

export interface CommunityContent {
  title: string;
  content: string;
  summary?: string;
}

export interface CommunityPost {
  metadata: CommunityMetadata;
  content: CommunityContent;
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