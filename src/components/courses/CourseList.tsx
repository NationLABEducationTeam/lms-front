import { FC } from 'react';
import { Card, Typography } from 'antd';
import { BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { S3Structure } from '@/types/s3';

const { Text } = Typography;

interface CourseListProps {
  courses: S3Structure[];
  userRole: string;
  onJoinClass: (coursePath: string) => void;
  onEdit: (course: S3Structure) => void;
  onDelete: (course: S3Structure) => void;
}

export const CourseList: FC<CourseListProps> = ({ 
  courses, 
  userRole, 
  onJoinClass, 
  onEdit, 
  onDelete 
}) => {
  if (!courses.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">수강 중인 강의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card
          key={course.path}
          hoverable
          onClick={() => onJoinClass(course.path)}
          cover={
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
              <BookOutlined className="text-4xl text-white" />
            </div>
          }
        >
          <Card.Meta
            title={course.name}
            description={
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarOutlined />
                  <Text type="secondary">16주 과정</Text>
                </div>
                <div className="flex items-center gap-2">
                  <TeamOutlined />
                  <Text type="secondary">수강생 0명</Text>
                </div>
              </div>
            }
          />
          {userRole === 'ADMIN' && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                수정
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course);
                }}
                className="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}; 