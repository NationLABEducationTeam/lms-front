export interface QnaMetadata {
  id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount: number;
  status: 'resolved' | 'pending';
  tags: string[];
}

export interface QnaContent {
  title: string;
  content: string;
}

export interface QnaAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface QnaPost {
  metadata: QnaMetadata;
  content: QnaContent;
  attachments: QnaAttachment[];
}

export interface QnaFormData {
  title: string;
  content: string;
  summary?: string;
  author: string;
  attachments?: File[];
}