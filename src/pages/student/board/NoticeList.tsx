import React, { FC, useEffect, useState } from 'react';
import { List, Typography, Space, Avatar, Button, Spin } from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const { Text, Title } = Typography;

const NoticeList: FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeList = await getNotices();
        setNotices(noticeList);
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        toast.error('공지사항 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>공지사항</Title>
      </div>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          pageSize: 10,
          total: notices.length,
        }}
        dataSource={notices}
        renderItem={(notice) => (
          <List.Item
            key={notice.metadata.id}
            onClick={() => navigate(`/student/notices/${notice.metadata.id}`)}
            className="cursor-pointer hover:bg-gray-50"
            actions={[
              <Space key="metadata">
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
            ]}
          >
            <List.Item.Meta
              title={notice.content.title}
              description={notice.content.summary}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default NoticeList; 