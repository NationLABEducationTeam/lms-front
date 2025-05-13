export interface Board {
  id: string;
  name: string;
  category: 'general' | 'qna' | 'study' | 'notice';
  postsCount: number;
  lastPost: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface BoardFormData {
  name: string;
  category: 'general' | 'qna' | 'study' | 'notice';
  status: 'active' | 'inactive';
  description?: string;
} 