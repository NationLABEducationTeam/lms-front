export interface Notice {
  id: string;
  title: string;
  content: string;
  attachments?: {
    key: string;
    name: string;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  title: string;
  content: string;
  attachments?: File[];
} 