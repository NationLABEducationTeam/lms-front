import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { AlertCircle, ArrowLeft, Download, Pencil, Trash } from 'lucide-react';
import { Notice } from '@/types/notice';
import { getNotice, deleteNotice } from '@/services/api/notices';
import { toast } from 'sonner';

const NoticeDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      
      try {
        const noticeData = await getNotice(id);
        setNotice(noticeData);
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
        toast.error('공지사항을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteNotice(id);
      toast.success('공지사항이 삭제되었습니다.');
      navigate('/admin/notices');
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      toast.error('공지사항 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          공지사항을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/admin/notices')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          {/* 헤더 */}
          <div className="border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {notice.metadata.isImportant && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <h1 className="text-2xl font-bold">{notice.content.title}</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div>작성자: {notice.metadata.author}</div>
              <div>
                작성일: {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
              </div>
              <div>조회수: {notice.metadata.viewCount}</div>
            </div>
          </div>

          {/* 메타데이터 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-blue-500/30">
                {notice.metadata.category}
              </Badge>
              {notice.metadata.tags.map(tag => (
                <Badge key={tag} className="bg-gray-500/30">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {notice.content.summary && (
              <div className="bg-white/5 rounded-lg p-4 text-gray-300">
                {notice.content.summary}
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="prose prose-invert max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: notice.content.content }}
          />

          {/* 첨부파일 */}
          {notice.attachments.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h2 className="text-lg font-medium mb-2">첨부파일</h2>
              <div className="space-y-2">
                {notice.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                      onClick={() => handleDownload(file.url, file.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 작업 버튼 */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate(`/admin/notices/edit/${notice.metadata.id}`)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              수정
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500/50 hover:bg-red-500/70"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="w-4 h-4 mr-2" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail; 