import React from 'react';
import { Badge, Space, Tooltip } from 'antd';
import { Clock } from 'lucide-react';

interface AttendanceTimerDisplayProps {
  showTitle?: boolean;
  currentCourseId?: string;
}

/**
 * 오프라인 출석 타이머 컴포넌트 (localStorage 직접 참조)
 */
const AttendanceTimerDisplay: React.FC<AttendanceTimerDisplayProps> = ({ showTitle = true, currentCourseId }) => {
  // localStorage에서 직접 읽기
  const timerRaw = localStorage.getItem('offline_attendance_timer');
  let timerState: { isRunning: boolean; courseId: string; elapsedTime: number } | null = null;
  if (timerRaw) {
    try {
      timerState = JSON.parse(timerRaw);
    } catch {}
  }

  // 1초마다 강제 리렌더
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timerState || !timerState.isRunning || (currentCourseId && timerState.courseId !== currentCourseId)) return null;

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Tooltip title="오프라인 출석 중입니다">
      <Space>
        {showTitle && <span className="text-gray-700 mr-1">출석시간:</span>}
        <Badge status="processing" color="green" />
        <Space size={4}>
          <Clock className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">{formatTime(timerState.elapsedTime)}</span>
        </Space>
      </Space>
    </Tooltip>
  );
};

export default AttendanceTimerDisplay;
