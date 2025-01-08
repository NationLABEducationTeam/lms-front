export interface QnaPost {
  metadata: {
    id: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    commentCount: number;
    isAnswered: boolean;
  };
  content: {
    title: string;
    body: string;
    summary?: string;
    attachments?: string[];
  };
}

export interface QnaFormData {
  title: string;
  content: string;
  summary?: string;
  author: string;
  attachments?: File[];
}