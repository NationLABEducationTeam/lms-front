import { FC, useState, useEffect } from 'react';
import { Calendar, Typography, Modal, Progress, Badge, Spin, Alert } from 'antd';
import type { Dayjs } from 'dayjs';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { attendanceApi } from '../../../services/api/attendance';
import type { AttendanceStats, AttendanceRecord } from '../../../types/attendance';
import { useAuth } from '../../../hooks/useAuth';

const { Text, Title } = Typography;

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

    &.present::before {
      background-color: #52c41a;
    }

    &.late::before {
      background-color: #faad14;
    }

    &.absent::before {
      background-color: #ff4d4f;
    }
  }
`;

const StatsContainer = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

// 임시 데이터 (API 연동 전까지 사용)
const mockData = {
  records: [
    {
      courseId: '1',
      courseName: '웹 개발 기초',
      sessionDate: dayjs().format('YYYY-MM-DD'),
      status: 'present',
      duration: 5400,
      joinTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      leaveTime: dayjs().add(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      courseId: '2',
      courseName: '알고리즘',
      sessionDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      status: 'late',
      duration: 4800,
      joinTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      leaveTime: dayjs().subtract(1, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    },
  ] as AttendanceRecord[],
  stats: {
    totalSessions: 2,
    presentCount: 1,
    lateCount: 1,
    absentCount: 0,
    attendanceRate: 75,
  } as AttendanceStats,
};

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  record?: AttendanceRecord;
}

const AttendanceModal: FC<AttendanceModalProps> = ({ visible, onClose, record }) => {
  if (!record) return null;

  return (
    <Modal
      title={`출석 정보 - ${record.courseName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div>
        <p><strong>날짜:</strong> {dayjs(record.sessionDate).format('YYYY년 MM월 DD일')}</p>
        <p><strong>상태:</strong> {
          record.status === 'present' ? '출석' :
          record.status === 'late' ? '지각' : '결석'
        }</p>
        {record.duration && <p><strong>참여 시간:</strong> {Math.floor(record.duration / 60)}분</p>}
        {record.joinTime && <p><strong>입장 시간:</strong> {dayjs(record.joinTime).format('HH:mm:ss')}</p>}
        {record.leaveTime && <p><strong>퇴장 시간:</strong> {dayjs(record.leaveTime).format('HH:mm:ss')}</p>}
      </div>
    </Modal>
  );
};

export const TodoCalendar: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | undefined>();
  const [modalVisible, setModalVisible] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.cognito_user_id) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
        const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
        
        // API가 준비되지 않았다면 임시 데이터 사용
        if (!import.meta.env.VITE_API_URL) {
          setAttendanceData(mockData.records);
          setStats(mockData.stats);
          return;
        }

        const response = await attendanceApi.getAttendanceRecords(user.cognito_user_id, startDate, endDate);
        setAttendanceData(response.records);
        setStats(response.stats);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
        setError('출석 데이터를 불러오는데 실패했습니다.');
        // 에러 발생 시 임시 데이터 사용
        setAttendanceData(mockData.records);
        setStats(mockData.stats);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.cognito_user_id]);

  const fullCellRender = (current: Dayjs) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayRecords = attendanceData.filter(record => record.sessionDate === dateStr);

    return (
      <div className="ant-picker-cell-inner ant-picker-calendar-date">
        <div className="ant-picker-calendar-date-value">{current.date()}</div>
        <div className="ant-picker-calendar-date-content">
          <ul className="events">
            {dayRecords.map((record, index) => (
              <li
                key={`${record.courseId}-${index}`}
                className={`event-item ${record.status}`}
                onClick={() => {
                  setSelectedRecord(record);
                  setModalVisible(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                {record.courseName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert
          message="오류"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <StatsContainer>
        <Title level={4}>출석 현황</Title>
        <StatsGrid>
          <div>
            <Progress 
              type="circle" 
              percent={stats.attendanceRate} 
              format={percent => `${percent?.toFixed(1)}%`}
              status={stats.attendanceRate >= 80 ? 'success' : stats.attendanceRate >= 60 ? 'normal' : 'exception'}
            />
            <Text style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>전체 출석률</Text>
          </div>
          <div>
            <div style={{ textAlign: 'center' }}>
              <Badge status="success" text={`출석: ${stats.presentCount}회`} style={{ display: 'block', marginBottom: '8px' }} />
              <Badge status="warning" text={`지각: ${stats.lateCount}회`} style={{ display: 'block', marginBottom: '8px' }} />
              <Badge status="error" text={`결석: ${stats.absentCount}회`} style={{ display: 'block' }} />
            </div>
          </div>
          <div>
            <Text>전체 수업: {stats.totalSessions}회</Text>
          </div>
        </StatsGrid>
      </StatsContainer>

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

      <AttendanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={selectedRecord}
      />
    </div>
  );
}; 