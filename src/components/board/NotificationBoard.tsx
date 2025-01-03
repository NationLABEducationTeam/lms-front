import { FC } from 'react';
import { List, Tag, Typography, Space, Button, theme } from 'antd';
import { PushpinOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;
const { useToken } = theme;

// 임시 데이터
const notifications = [
  {
    id: 1,
    title: '2024년도 1학기 수강신청 안내',
    content: '2024년도 1학기 수강신청 일정 및 유의사항을 안내드립니다.',
    createdAt: '2024-01-02',
    views: 245,
    isImportant: true
  },
  {
    id: 2,
    title: '시스템 정기 점검 안내',
    content: '시스템 안정화를 위한 정기 점검이 진행될 예정입니다.',
    createdAt: '2024-01-01',
    views: 156,
    isImportant: true
  },
  {
    id: 3,
    title: '온라인 강의 수강 가이드',
    content: '온라인 강의 수강 방법 및 주의사항 안내드립니다.',
    createdAt: '2023-12-30',
    views: 324,
    isImportant: false
  }
];

const NotificationBoard: FC = () => {
  const { token } = useToken();

  return (
    <div>
      <div style={{ marginBottom: token.marginMD, textAlign: 'right' }}>
        <Button type="primary">공지사항 작성</Button>
      </div>
      <List
        itemLayout="vertical"
        dataSource={notifications}
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
              {item.isImportant && (
                <Tag color="red" icon={<PushpinOutlined />} style={{ marginRight: token.marginSM }}>
                  중요
                </Tag>
              )}
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

export default NotificationBoard; 