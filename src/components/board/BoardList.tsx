import { FC } from 'react';
import { List, Tag, Typography, Space, Avatar, theme, Col, Row, Card } from 'antd';
import { UserOutlined, MessageOutlined, EyeOutlined, NotificationOutlined, TeamOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Text, Link, Title } = Typography;
const { useToken } = theme;

interface Post {
  id: number;
  type: 'notice' | 'community' | 'qna';
  title: string;
  content: string;
  author: string;
  authorRole?: string;
  createdAt: string;
  views: number;
  replies: number;
}

const posts: Post[] = [
  // 공지사항
  {
    id: 1,
    type: 'notice',
    title: '[공지] 2024학년도 1학기 중간고사 안내',
    content: '중간고사 일정 및 시험 범위를 안내드립니다.',
    author: '관리자',
    authorRole: 'ADMIN',
    createdAt: '2024.03.10',
    views: 245,
    replies: 12
  },
  {
    id: 2,
    type: 'notice',
    title: '[과제] 컴퓨터 비전 프로젝트 제출 안내',
    content: '프로젝트 제출 방법 및 마감일을 안내드립니다.',
    author: '김교수',
    authorRole: 'INSTRUCTOR',
    createdAt: '2024.03.09',
    views: 189,
    replies: 8
  },
  // 자유게시판
  {
    id: 3,
    type: 'community',
    title: '스터디 모집합니다',
    content: '알고리즘 스터디원을 모집합니다.',
    author: '이학생',
    authorRole: 'STUDENT',
    createdAt: '2024.03.08',
    views: 156,
    replies: 5
  },
  {
    id: 4,
    type: 'community',
    title: '자격증 시험 후기',
    content: '지난 주 자격증 시험 후기입니다.',
    author: '김학생',
    authorRole: 'STUDENT',
    createdAt: '2024.03.07',
    views: 142,
    replies: 7
  },
  // Q&A
  {
    id: 5,
    type: 'qna',
    title: '수업 자료 관련 질문이 있습니다.',
    content: '3주차 강의 자료 중 이해가 안 되는 부분이 있어서 질문드립니다.',
    author: '홍길동',
    authorRole: 'STUDENT',
    createdAt: '2024.03.08',
    views: 42,
    replies: 3
  },
  {
    id: 6,
    type: 'qna',
    title: '과제 제출 관련 문의',
    content: '과제 제출 시스템 오류가 발생합니다.',
    author: '박학생',
    authorRole: 'STUDENT',
    createdAt: '2024.03.06',
    views: 38,
    replies: 2
  }
];

const getRoleColor = (role?: string) => {
  const colors = {
    ADMIN: '#ff4d4f',
    INSTRUCTOR: '#722ed1',
    STUDENT: '#1890ff'
  };
  return colors[role as keyof typeof colors] || '#666';
};

const PostItem: FC<{ post: Post }> = ({ post }) => {
  const { token } = useToken();
  
  return (
    <div
      className="hover:bg-gray-50 transition-all duration-300"
      style={{
        padding: token.padding,
        marginBottom: token.marginSM,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        cursor: 'pointer'
      }}
    >
      <Link strong style={{ fontSize: token.fontSize, display: 'block', marginBottom: token.marginXS }}>
        {post.title}
      </Link>
      <Text type="secondary" style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: token.marginXS }}>
        {post.content}
      </Text>
      <Space size="middle" style={{ fontSize: token.fontSizeSM }}>
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: getRoleColor(post.authorRole) }} 
          />
          <Text style={{ color: getRoleColor(post.authorRole) }}>{post.author}</Text>
        </Space>
        <Text type="secondary">{post.createdAt}</Text>
        <Space>
          <MessageOutlined />
          <Text type="secondary">{post.replies}</Text>
        </Space>
        <Space>
          <EyeOutlined />
          <Text type="secondary">{post.views}</Text>
        </Space>
      </Space>
    </div>
  );
};

const BoardColumn: FC<{
  title: string;
  icon: React.ReactNode;
  type: Post['type'];
  posts: Post[];
}> = ({ title, icon, type, posts }) => {
  const { token } = useToken();
  const filteredPosts = posts.filter(post => post.type === type);

  return (
    <Card
      title={
        <Space>
          {icon}
          <Text strong>{title}</Text>
          <Text type="secondary">({filteredPosts.length})</Text>
        </Space>
      }
      style={{ height: '100%' }}
    >
      {filteredPosts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </Card>
  );
};

export const BoardList: FC = () => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <BoardColumn
          title="공지사항"
          icon={<NotificationOutlined style={{ color: '#ff4d4f' }} />}
          type="notice"
          posts={posts}
        />
      </Col>
      <Col span={8}>
        <BoardColumn
          title="자유게시판"
          icon={<TeamOutlined style={{ color: '#1890ff' }} />}
          type="community"
          posts={posts}
        />
      </Col>
      <Col span={8}>
        <BoardColumn
          title="Q&A"
          icon={<QuestionCircleOutlined style={{ color: '#52c41a' }} />}
          type="qna"
          posts={posts}
        />
      </Col>
    </Row>
  );
}; 