import React, { FC, useEffect, useState } from 'react';
import { List, Typography, Space, Avatar, Button, Spin } from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '@/components/common/ui/card';
import { Bell, ChevronRight, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/common/ui/input';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

const NoticeList: FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const data = await getNotices();
        setNotices(data);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice =>
    notice.content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
              <p className="mt-1 text-gray-500">
                총 {notices.length}개의 공지사항이 있습니다
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 공지사항 목록 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="space-y-4">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.metadata.isImportant && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              중요
                            </span>
                          )}
                          <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {notice.content.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{notice.metadata.author}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(notice.metadata.createdAt), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                          <span>•</span>
                          <span>조회 {notice.metadata.viewCount}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">공지사항이 없습니다</h3>
            <p className="mt-2 text-sm text-gray-500">새로운 공지사항이 등록되면 이곳에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeList; 