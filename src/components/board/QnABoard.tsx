import { FC } from 'react';
import { List, Tag, Typography, Space, Button, theme } from 'antd';
import { QuestionCircleOutlined, CheckCircleOutlined, EyeOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;
const { useToken } = theme;

// 임시 데이터
const qnas = [
  {
    id: 1,
    title: '과제 제출 기한 연장 가능한가요?',
    content: '개인 사정으로 인해 과제 제출이 늦어질 것 같습니다.',
    createdAt: '2024-01-02',
    views: 42,
    replies: 2,
    isAnswered: true,
    category: '과제'
  },
  {
    id: 2,
    title: '강의 영상이 재생되지 않습니다.',
    content: '3주차 2강 영상이 재생되지 않는 문제가 있습니다.',
    createdAt: '2024-01-01',
    views: 38,
    replies: 1,
    isAnswered: false,
    category: '기술'
  },
  {
    id: 3,
    title: '수료증 발급 절차 문의',
    content: '강좌 수료 후 수료증 발급은 어떻게 진행되나요?',
    createdAt: '2023-12-31',
    views: 56,
    replies: 3,
    isAnswered: true,
    category: '수료'
  }
];

const QnABoard: FC = () => {
  const { token } = useToken();

  return (
    <div>
      <div style={{ marginBottom: token.marginMD, textAlign: 'right' }}>
        <Button type="primary" icon={<QuestionCircleOutlined />}>
          질문하기
        </Button>
      </div>
      <List
        itemLayout="vertical"
        dataSource={qnas}
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
              <Tag color={item.isAnswered ? 'success' : 'processing'} icon={item.isAnswered ? <CheckCircleOutlined /> : <QuestionCircleOutlined />}>
                {item.isAnswered ? '답변완료' : '답변대기'}
              </Tag>
              <Tag color="blue" style={{ marginRight: token.marginSM }}>
                {item.category}
              </Tag>
              <Link strong>{item.title}</Link>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
              {item.content}
            </Text>
            <Space size="large" style={{ color: token.colorTextSecondary }}>
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">{item.createdAt}</Text>
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

export default QnABoard; 