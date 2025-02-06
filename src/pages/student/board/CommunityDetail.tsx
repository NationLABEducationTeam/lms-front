import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { getCommunityPost } from '@/services/api/community';
import { toast } from 'sonner';

const CommunityDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postData = await getCommunityPost(id);
        setPost(postData);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        toast.error('게시글을 불러오는데 실패했습니다.');
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
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/community')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{post.content.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span>{post.metadata.author}</span>
              <span>{new Date(post.metadata.createdAt).toLocaleDateString()}</span>
              <span>조회 {post.metadata.viewCount}</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* 본문 */}
            <div className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: post.content.content }}
            />

            {/* 첨부파일 */}
            {post.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-medium mb-2">첨부파일</h2>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityDetail; 