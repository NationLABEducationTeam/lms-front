import { FC } from 'react';
import { Calendar } from '@/components/common/ui/calendar';
import type { Dayjs } from 'dayjs';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'success' | 'processing' | 'error' | 'warning' | 'default';
}

export const TodoCalendar: FC = () => {
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: '컴퓨터 비전 1주차 강의',
      date: '2024-01-15',
      type: 'processing'
    },
    {
      id: '2',
      title: 'AWS SAA 자격증 퀴즈',
      date: '2024-01-15',
      type: 'warning'
    },
    {
      id: '3',
      title: '머신러닝 과제 제출',
      date: '2024-01-20',
      type: 'error'
    }
  ];

  const handleDateSelect = (date: Dayjs) => {
    console.log('Selected date:', date.format('YYYY-MM-DD'));
  };

  return (
    <Calendar
      events={events}
      onSelect={handleDateSelect}
    />
  );
}; 