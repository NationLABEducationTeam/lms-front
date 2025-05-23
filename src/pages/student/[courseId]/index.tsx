import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Space, Tabs } from 'antd';
import { BookOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // 탭 이동 핸들러
  const handleTabChange = (key: string) => {
    if (key === 'overview') return; // 현재 페이지
    navigate(`/${courseId}/${key}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 강의 헤더 */}
      <Card className="mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <BookOutlined className="text-2xl text-blue-500" />
          </div>
          <div className="flex-1">
            <Title level={2} className="!mb-1">{courseId?.replace(/_/g, ' ')}</Title>
            <Space className="text-gray-500">
              <Space>
                <CalendarOutlined />
                <span>강의 정보</span>
              </Space>
            </Space>
          </div>
        </div>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs
        defaultActiveKey="overview"
        onChange={handleTabChange}
        items={[
          { key: 'overview', label: '강의 개요' },
          { key: 'materials', label: '자료실' },
          { key: 'assignments', label: '과제' },
          { key: 'notes', label: '노트' },
          { key: 'board', label: '게시판' },
        ]}
      />
      {/* 강의 개요/소개 등 추가 가능 */}
      <div className="mt-8">
        <p className="text-lg text-gray-700">강의 소개 및 공통 정보 영역입니다.</p>
      </div>
    </div>
  );
};

export default CourseDetail; 