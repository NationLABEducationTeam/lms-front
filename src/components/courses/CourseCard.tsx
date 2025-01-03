import { FC } from 'react';
import { Card, Progress, Tag, Typography, Space } from 'antd';
import { BookOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { S3Structure } from '@/types/s3';

const { Text } = Typography;

interface CourseCardProps {
  course: S3Structure;
  meta?: any;
  onClick?: () => void;
}

export const CourseCard: FC<CourseCardProps> = ({ course, meta, onClick }) => {
  const progress = meta?.progress || 0;
  const totalStudents = meta?.totalStudents || 0;
  const startDate = meta?.startDate ? new Date(meta.startDate).toLocaleDateString() : '미정';
  const duration = meta?.duration || '16주';

  const getStatusColor = (progress: number) => {
    if (progress === 0) return 'default';
    if (progress < 30) return 'red';
    if (progress < 70) return 'blue';
    return 'green';
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
          <BookOutlined className="text-4xl text-white" />
        </div>
      }
    >
      <Card.Meta
        title={
          <div className="flex items-center justify-between">
            <Text strong>{course.name}</Text>
            <Tag color={getStatusColor(progress)}>
              {progress === 0 ? '예정' : `${progress}% 완료`}
            </Tag>
          </div>
        }
        description={
          <Space direction="vertical" className="w-full mt-2">
            <Progress percent={progress} size="small" />
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-gray-400" />
                <Text type="secondary">{startDate}</Text>
              </div>
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-gray-400" />
                <Text type="secondary">{duration}</Text>
              </div>
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-gray-400" />
                <Text type="secondary">수강생 {totalStudents}명</Text>
              </div>
            </div>

            {meta?.description && (
              <Text type="secondary" className="mt-2 line-clamp-2">
                {meta.description}
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
}; 