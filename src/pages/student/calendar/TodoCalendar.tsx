import { FC } from 'react';
import { Calendar, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import styled from '@emotion/styled';
import dayjs from 'dayjs';

const { Text } = Typography;

const StyledCalendar = styled(Calendar)`
  .events {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .event-item {
    margin-bottom: 4px;
    padding-left: 10px;
    position: relative;
    font-size: 12px;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transform: translateY(-50%);
    }

    &.warning::before {
      background-color: #faad14;
    }

    &.usual::before {
      background-color: #52c41a;
    }

    &.error::before {
      background-color: #ff4d4f;
    }
  }
`;

interface TodoEvent {
  id: number;
  date: string;
  type: 'warning' | 'usual' | 'error';
  title: string;
}

// 현재 월의 랜덤한 날짜 생성
const getRandomDate = () => {
  const currentDate = dayjs();
  const year = currentDate.year();
  const month = currentDate.month();
  const daysInMonth = currentDate.daysInMonth();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  return dayjs(`${year}-${month + 1}-${randomDay}`).format('YYYY-MM-DD');
};

// 랜덤한 이벤트 타입 생성
const eventTypes: TodoEvent['type'][] = ['warning', 'usual', 'error'];
const getRandomEventType = () => {
  return eventTypes[Math.floor(Math.random() * eventTypes.length)];
};

// 랜덤한 이벤트 제목 생성
const eventTitles = [
  '프로젝트 제출 마감일',
  '팀 미팅',
  '코드 리뷰',
  '데일리 스크럼',
  '스프린트 회고',
  '기술 세미나',
  '알고리즘 스터디',
  '데이터베이스 설계',
  'UI/UX 리뷰',
  '배포 일정'
];
const getRandomEventTitle = () => {
  return eventTitles[Math.floor(Math.random() * eventTitles.length)];
};

// 5개의 랜덤 이벤트 생성
const events: TodoEvent[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  date: getRandomDate(),
  type: getRandomEventType(),
  title: getRandomEventTitle()
}));

export const TodoCalendar: FC = () => {
  const fullCellRender = (current: Dayjs) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayEvents = events.filter(event => event.date === dateStr);

    return (
      <div className="ant-picker-cell-inner ant-picker-calendar-date">
        <div className="ant-picker-calendar-date-value">{current.date()}</div>
        <div className="ant-picker-calendar-date-content">
          <ul className="events">
            {dayEvents.map(event => (
              <li
                key={event.id}
                className={`event-item ${event.type}`}
              >
                {event.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <StyledCalendar
        fullCellRender={fullCellRender}
        mode="month"
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      />
    </div>
  );
}; 