import { FC, useEffect, useState } from 'react';
import { List, Tag, Typography, Space, Avatar, theme, Col, Row, Card, Button } from 'antd';
import { UserOutlined, MessageOutlined, EyeOutlined, NotificationOutlined, TeamOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Notice } from '@/types/notice';
import { CommunityPost } from '@/types/community';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { toast } from 'sonner';
import CommunityBoard from './CommunityBoard';
import { useNavigate } from 'react-router-dom';

const { Text, Link } = Typography;
const { useToken } = theme;

interface NoticeItemProps {
  notice: Notice;
  onClick: () => void;
}

const NoticeItem: FC<NoticeItemProps> = ({ notice, onClick }) => {
  const { token } = useToken();

  return (
    <div 
      style={{ marginBottom: token.marginMD, padding: token.paddingSM, borderBottom: `1px solid ${token.colorBorderSecondary}`, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{ marginBottom: token.marginXS }}>
        <Link strong>{notice.content.title}</Link>
      </div>
      {notice.content.summary && (
        <Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          {notice.content.summary}
        </Text>
      )}
      <Space size="large" style={{ color: token.colorTextSecondary }}>
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text type="secondary">{notice.metadata.author}</Text>
        </Space>
        <Text type="secondary">
          {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
        </Text>
        <Space>
          <EyeOutlined />
          <Text type="secondary">{notice.metadata.viewCount}</Text>
        </Space>
      </Space>
    </div>
  );
};

interface CommunityItemProps {
  post: CommunityPost;
  onClick: () => void;
}

const CommunityItem: FC<CommunityItemProps> = ({ post, onClick }) => {
  const { token } = useToken();

  return (
    <div 
      style={{ marginBottom: token.marginMD, padding: token.paddingSM, borderBottom: `1px solid ${token.colorBorderSecondary}`, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{ marginBottom: token.marginXS }}>
        <Link strong>{post.content.title}</Link>
      </div>
      {post.content.summary && (
        <Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          {post.content.summary}
        </Text>
      )}
      <Space size="large" style={{ color: token.colorTextSecondary }}>
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text type="secondary">{post.metadata.author}</Text>
        </Space>
        <Text type="secondary">
          {new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}
        </Text>
        <Space>
          <EyeOutlined />
          <Text type="secondary">{post.metadata.viewCount}</Text>
        </Space>
        <Space>
          <MessageOutlined />
          <Text type="secondary">{post.metadata.commentCount}</Text>
        </Space>
      </Space>
    </div>
  );
};

const NoticeColumn: FC = () => {
  const navigate = useNavigate();
  const { token } = useToken();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeList = await getNotices();
        setNotices(noticeList.slice(0, 5));
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        toast.error('공지사항 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <Card
      title={
        <Space>
          <NotificationOutlined style={{ color: '#ff4d4f' }} />
          <Text strong>공지사항</Text>
          <Text type="secondary">({notices.length})</Text>
        </Space>
      }
      extra={
        <Button type="link" onClick={() => navigate('/student/notices')}>
          더 보기
        </Button>
      }
      style={{ height: '100%' }}
      loading={loading}
    >
      {notices.map(notice => (
        <NoticeItem 
          key={notice.metadata.id} 
          notice={notice} 
          onClick={() => navigate(`/student/notices/${notice.metadata.id}`)}
        />
      ))}
    </Card>
  );
};

const CommunityColumn: FC = () => {
  const navigate = useNavigate();
  const { token } = useToken();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postList = await getCommunityPosts();
        setPosts(postList.slice(0, 5));
      } catch (error) {
        console.error('자유게시판 목록 조회 실패:', error);
        toast.error('자유게시판 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <Text strong>자유게시판</Text>
          <Text type="secondary">({posts.length})</Text>
        </Space>
      }
      extra={
        <Space>
          <Button type="link" onClick={() => navigate('/student/community')}>
            더 보기
          </Button>
          <Button type="primary" onClick={() => navigate('/student/community/create')}>
            글쓰기
          </Button>
        </Space>
      }
      style={{ height: '100%' }}
      loading={loading}
    >
      {posts.map(post => (
        <CommunityItem 
          key={post.metadata.id} 
          post={post}
          onClick={() => navigate(`/student/community/${post.metadata.id}`)}
        />
      ))}
    </Card>
  );
};

const QnaColumn: FC = () => {
  const navigate = useNavigate();
  const { token } = useToken();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // TODO: QNA API 연동
        setPosts([]);
      } catch (error) {
        console.error('Q&A 목록 조회 실패:', error);
        toast.error('Q&A 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Card
      title={
        <Space>
          <QuestionCircleOutlined style={{ color: '#52c41a' }} />
          <Text strong>Q&A</Text>
          <Text type="secondary">({posts.length})</Text>
        </Space>
      }
      extra={
        <Space>
          <Button type="link" onClick={() => navigate('/student/qna')}>
            더 보기
          </Button>
          <Button type="primary" onClick={() => navigate('/student/qna/create')}>
            글쓰기
          </Button>
        </Space>
      }
      style={{ height: '100%' }}
      loading={loading}
    >
      {posts.map(post => (
        <CommunityItem 
          key={post.metadata.id} 
          post={post}
          onClick={() => navigate(`/student/qna/${post.metadata.id}`)}
        />
      ))}
    </Card>
  );
};

export const BoardList: FC = () => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <NoticeColumn />
      </Col>
      <Col span={8}>
        <CommunityColumn />
      </Col>
      <Col span={8}>
        <QnaColumn />
      </Col>
    </Row>
  );
};