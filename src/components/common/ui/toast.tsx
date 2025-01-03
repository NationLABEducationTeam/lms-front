import { FC } from 'react';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const toast: FC<ToastProps> = ({ title, description, variant = 'default' }) => {
  // 실제 토스트 구현은 추후에...
  console.log({ title, description, variant });
  return null;
}; 