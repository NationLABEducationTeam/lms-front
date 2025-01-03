export type QuizStatus = 'COMPLETED' | 'NOT_STARTED' | 'NOT_AVAILABLE';

export interface QuizStatusConfig {
  status: QuizStatus;
  label: string;
  color: string;
  isButtonDisabled: boolean;
}

export const QUIZ_STATUS_CONFIG: Record<QuizStatus, QuizStatusConfig> = {
  COMPLETED: {
    status: 'COMPLETED',
    label: '완료',
    color: 'text-green-500 bg-green-50',
    isButtonDisabled: false
  },
  NOT_STARTED: {
    status: 'NOT_STARTED',
    label: '미완료',
    color: 'text-yellow-500 bg-yellow-50',
    isButtonDisabled: false
  },
  NOT_AVAILABLE: {
    status: 'NOT_AVAILABLE',
    label: '준비중',
    color: 'text-gray-500 bg-gray-50',
    isButtonDisabled: true
  }
};

export interface Quiz {
  id: number;
  title: string;
  type: 'quiz';
  status: QuizStatus;
  weekNum: number;
} 