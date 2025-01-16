import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { MessageCircle, Eye, ArrowLeft } from 'lucide-react';
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
          {post.metadata.isAnswered && (
            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
              답변완료
            </span>
          )}
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
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 질문 내용 */}
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content.body }} />
        </div>

        {/* 첨부파일 */}
        {post.content.attachments && post.content.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">첨부파일</h3>
            <ul className="space-y-1">
              {post.content.attachments.map((file, index) => (
                <li key={index}>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    첨부파일 {index + 1}
                  </a>
                </li>
              ))}
            </ul>
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