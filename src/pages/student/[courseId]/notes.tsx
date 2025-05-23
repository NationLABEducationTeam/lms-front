import { FC } from 'react';
import { Typography, Empty } from 'antd';

const { Title } = Typography;

const CourseNotes: FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={3} className="mb-4">노트</Title>
      <Empty description={<span>아직 노트가 등록되지 않았습니다.</span>} />
    </div>
  );
};

export default CourseNotes; 