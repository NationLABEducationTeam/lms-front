import { FC } from 'react';
import { Typography, Empty } from 'antd';

const { Title } = Typography;

const CourseBoard: FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={3} className="mb-4">게시판</Title>
      <Empty description={<span>아직 게시글이 등록되지 않았습니다.</span>} />
    </div>
  );
};

export default CourseBoard; 