import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Plus } from 'lucide-react';
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
                  key={notice.id}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/notices/${notice.id}`)}
                >
                  <h3 className="text-lg font-medium mb-2">{notice.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>
                      첨부파일: {notice.attachments?.length || 0}개
                    </span>
                    <span>
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
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