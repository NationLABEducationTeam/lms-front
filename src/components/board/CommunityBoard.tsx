import { FC } from 'react';
import { List, Tag, Typography, Space, Button, Avatar, theme } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;
const { useToken } = theme;

// 임시 데이터
const posts = [
  {
    id: 1,
    title: '프로그래밍 스터디 모집합니다',
    content: '주 2회 온라인으로 진행되는 프로그래밍 스터디원을 모집합니다.',
    author: '김철수',
    createdAt: '2024-01-02',
    views: 128,
    likes: 15,
    replies: 8,
    category: '스터디'
  },
  {
    id: 2,
    title: '자격증 시험 후기 공유',
    content: '지난 주에 본 자격증 시험 후기를 공유드립니다.',
    author: '이영희',
    createdAt: '2024-01-01',
    views: 256,
    likes: 24,
    replies: 12,
    category: '후기'
  },
  {
    id: 3,
    title: '온라인 강의 꿀팁 공유',
    content: '효율적인 온라인 강의 수강을 위한 꿀팁을 공유합니다.',
    author: '박지민',
    createdAt: '2023-12-31',
    views: 312,
    likes: 45,
    replies: 18,
    category: '꿀팁'
  }
];

const CommunityBoard: FC = () => {
  const { token } = useToken();

  return (
    <div>
      <div style={{ marginBottom: token.marginMD, textAlign: 'right' }}>
        <Button type="primary">글쓰기</Button>
      </div>
      <List
        itemLayout="vertical"
        dataSource={posts}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              padding: token.padding,
              marginBottom: token.marginSM,
              border: `1px solid ${token.colorBorderSecondary}`
            }}
          >
            <div style={{ marginBottom: token.marginXS }}>
              <Tag color="purple" style={{ marginRight: token.marginSM }}>
                {item.category}
              </Tag>
              <Link strong>{item.title}</Link>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
              {item.content}
            </Text>
            <Space size="large" style={{ color: token.colorTextSecondary }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text type="secondary">{item.author}</Text>
              </Space>
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">{item.createdAt}</Text>
              </Space>
              <Space>
                <LikeOutlined />
                <Text type="secondary">{item.likes}</Text>
              </Space>
              <Space>
                <MessageOutlined />
                <Text type="secondary">{item.replies}</Text>
              </Space>
              <Space>
                <EyeOutlined />
                <Text type="secondary">{item.views}</Text>
              </Space>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommunityBoard; 