import { FC } from 'react';
import { List, Tag, Typography, Space, Button, Avatar, theme } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CommunityPost } from '@/types/community';

const { Text, Link } = Typography;
const { useToken } = theme;

interface CommunityBoardProps {
  posts: CommunityPost[];
  onPostClick: (postId: string) => void;
  onCreateClick: () => void;
}

const CommunityBoard: FC<CommunityBoardProps> = ({ posts, onPostClick, onCreateClick }) => {
  const { token } = useToken();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">자유게시판</h2>
        <Button type="primary" onClick={onCreateClick}>
          글쓰기
        </Button>
      </div>

      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          pageSize: 10,
          position: 'bottom',
          align: 'center'
        }}
        dataSource={posts}
        renderItem={(post) => (
          <List.Item
            key={post.metadata.id}
            onClick={() => onPostClick(post.metadata.id)}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            actions={[
              <Space key="views">
                <EyeOutlined />
                {post.metadata.viewCount}
              </Space>,
              <Space key="comments">
                <MessageOutlined />
                {post.metadata.commentCount}
              </Space>,
              <Space key="date">
                <ClockCircleOutlined />
                {new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}
              </Space>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={post.content.title}
              description={
                <Space size={[0, 8]} wrap>
                  <Text type="secondary">{post.metadata.author}</Text>
                </Space>
              }
            />
            {post.content.summary && (
              <Text type="secondary" className="line-clamp-2">
                {post.content.summary}
              </Text>
            )}
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommunityBoard; 