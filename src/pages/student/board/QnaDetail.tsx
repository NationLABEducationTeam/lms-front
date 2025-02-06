import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { MessageCircle, Eye, ArrowLeft, Download } from 'lucide-react';
import { QnaPost } from '@/types/qna';
import { getQnaPost } from '@/services/api/qna';
import { toast } from 'sonner';

const QnaDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<QnaPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postData = await getQnaPost(id);
        setPost(postData);
      } catch (error) {
        console.error('질문 상세 조회 실패:', error);
        toast.error('질문을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Q&A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Q&A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            질문을 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/qna')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            post.metadata.status === 'resolved'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {post.metadata.status === 'resolved' ? '해결됨' : '답변 대기중'}
          </span>
        </div>
        <div>
          <CardTitle className="text-2xl mb-2">{post.content.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.metadata.author}</span>
            <span>{new Date(post.metadata.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.metadata.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.metadata.commentCount}</span>
            </div>
          </div>
          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {post.metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 질문 내용 */}
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content.content }} />
        </div>

        {/* 첨부파일 */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">첨부파일</h3>
            <div className="space-y-2">
              {post.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="hover:bg-gray-200"
                    onClick={() => handleDownload(file.url, file.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 답변 섹션 */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">답변</h3>
          {/* TODO: 답변 목록 및 작성 기능 구현 */}
          <div className="text-center text-gray-500 py-4">
            아직 답변이 없습니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QnaDetail; 