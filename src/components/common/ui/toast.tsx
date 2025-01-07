import { FC } from 'react';

// TODO: 토스트 구현 => 웹 애플리케이션에서 사용자에게 알림을 보여주는 토스트
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