import React from 'react';
import { Badge, Space, Tooltip } from 'antd';
import { Clock } from 'lucide-react';
import { useAttendanceTimer } from '@/hooks/useAttendanceTimer';

interface AttendanceTimerDisplayProps {
  showTitle?: boolean;
}

/**
 * 오프라인 출석 타이머 컴포넌트
 * 현재 타이머가 실행 중인지 여부와 경과 시간을 표시합니다.
 * 모든 페이지에서 동일하게 사용되어 타이머가 실행 중일 때 진행 상황을 확인할 수 있습니다.
 */
const AttendanceTimerDisplay: React.FC<AttendanceTimerDisplayProps> = ({ showTitle = true }) => {
  const { isTimerRunning, formattedTime, courseId } = useAttendanceTimer();

  if (!isTimerRunning) return null;

  return (
    <Tooltip title="오프라인 출석 중입니다">
      <Space>
        {showTitle && <span className="text-gray-700 mr-1">출석시간:</span>}
        <Badge status="processing" color="green" />
        <Space size={4}>
          <Clock className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">{formattedTime}</span>
        </Space>
      </Space>
    </Tooltip>
  );
};

export default AttendanceTimerDisplay;
