import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Plus, AlertCircle } from 'lucide-react';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { toast } from 'sonner';

const NoticeList: FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeList = await getNotices();
        setNotices(noticeList || []);
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        toast.error('공지사항 목록을 불러오는데 실패했습니다.');
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <Button
            onClick={() => navigate('/admin/notices/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          {loading ? (
            <div className="text-center py-4">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice.metadata.id}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/notices/${notice.metadata.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notice.metadata.isImportant && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <h3 className="text-lg font-medium">{notice.content.title}</h3>
                      </div>
                      {notice.content.summary && (
                        <p className="text-sm text-gray-300 mb-2">{notice.content.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-blue-500/30">
                          {notice.metadata.category}
                        </Badge>
                        {notice.metadata.tags.map(tag => (
                          <Badge key={tag} className="bg-gray-500/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">
                        {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        조회수: {notice.metadata.viewCount}
                      </div>
                    </div>
                  </div>
                  {notice.attachments.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      첨부파일: {notice.attachments.length}개
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeList; 