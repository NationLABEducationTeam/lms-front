import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, List, Button, Empty, Divider, Tag, Space, Spin } from 'antd';
import { useGetCourseAssignmentsQuery } from '@/services/api/studentApi';

const { Title, Text } = Typography;

const CourseAssignments: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: assignments = [], isLoading, error } = useGetCourseAssignmentsQuery(courseId || '');

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="과제를 불러오는 중..." /></div>;
  }
  if (error) {
    return <div className="p-6"><Empty description="과제 정보를 불러올 수 없습니다." /></div>;
  }
  if (!assignments || assignments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Title level={3} className="mb-4">과제</Title>
        <Empty description={<span>아직 과제가 등록되지 않았습니다.</span>} />
      </div>
    );
  }

  // 상태별 분류
  const pending = assignments.filter(a => a.status === '진행중');
  const overdue = assignments.filter(a => a.status === '마감됨' && !a.is_completed);
  const completed = assignments.filter(a => a.is_completed);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={3} className="mb-4">과제</Title>
      {pending.length > 0 && (
        <>
          <Divider orientation="left">진행 중인 과제</Divider>
          <List
            dataSource={pending}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="primary" onClick={() => navigate(`/assignments/${item.item_id}`)}>과제 제출</Button>
                ]}
              >
                <List.Item.Meta
                  title={<Space><Text strong>{item.title}</Text><Tag color="blue">{item.course_title}</Tag></Space>}
                  description={<Space direction="vertical"><Text>{(item as any).description || '설명 없음'}</Text></Space>}
                />
              </List.Item>
            )}
          />
        </>
      )}
      {overdue.length > 0 && (
        <>
          <Divider orientation="left">기한 초과 과제</Divider>
          <List
            dataSource={overdue}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="primary" danger onClick={() => navigate(`/assignments/${item.item_id}`)}>지금 제출</Button>
                ]}
              >
                <List.Item.Meta
                  title={<Space><Text strong>{item.title}</Text><Tag color="red">기한 초과</Tag></Space>}
                  description={<Space direction="vertical"><Text>{(item as any).description || '설명 없음'}</Text></Space>}
                />
              </List.Item>
            )}
          />
        </>
      )}
      {completed.length > 0 && (
        <>
          <Divider orientation="left">완료된 과제</Divider>
          <List
            dataSource={completed}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button onClick={() => navigate(`/assignments/${item.item_id}`)}>제출물 보기</Button>
                ]}
              >
                <List.Item.Meta
                  title={<Space><Text strong>{item.title}</Text><Tag color="green">완료</Tag></Space>}
                  description={<Space direction="vertical"><Text>{(item as any).description || '설명 없음'}</Text></Space>}
                />
              </List.Item>
            )}
          />
        </>
      )}
      {pending.length === 0 && overdue.length === 0 && completed.length === 0 && (
        <Empty description={<span>아직 과제가 등록되지 않았습니다.</span>} />
      )}
    </div>
  );
};

export default CourseAssignments; 