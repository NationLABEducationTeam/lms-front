import { FC } from 'react';
import { Calendar as AntCalendar, Badge } from 'antd';
import type { Dayjs } from 'dayjs';
import type { BadgeProps } from 'antd';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'success' | 'processing' | 'error' | 'warning' | 'default';
}

interface CalendarProps {
  events?: CalendarEvent[];
  onSelect?: (date: Dayjs) => void;
}

export const Calendar: FC<CalendarProps> = ({ events = [], onSelect }) => {
  const dateCellRender = (date: Dayjs) => {
    const dayEvents = events.filter(
      event => date.format('YYYY-MM-DD') === event.date
    );

    return (
      <ul className="events">
        {dayEvents.map(event => (
          <li key={event.id}>
            <Badge
              status={event.type as BadgeProps['status']}
              text={event.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full calendar-wrapper">
      <AntCalendar
        onSelect={onSelect}
        cellRender={(date) => dateCellRender(date as Dayjs)}
        className="bg-white rounded-lg shadow-sm p-4"
      />
      <style>
        {`
          .calendar-wrapper .events {
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .calendar-wrapper .events li {
            margin-bottom: 4px;
            padding: 0;
            font-size: 12px;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>
    </div>
  );
}; 