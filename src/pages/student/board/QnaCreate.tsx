import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import RichTextEditor from '@/components/common/editor/RichTextEditor';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { useAuth } from '@/hooks/useAuth';
import { createQnaPost } from '@/services/api/qna';
import { toast } from 'sonner';

const QnaCreate: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      await createQnaPost({
        title,
        content,
        author: user?.name || '익명',
        attachments
      });

      toast.success('질문이 등록되었습니다.');
      navigate('/qna');
    } catch (error) {
      console.error('질문 등록 실패:', error);
      toast.error('질문 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>질문하기</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문의 제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>내용</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="질문 내용을 자세히 작성해주세요"
            />
          </div>

          <div className="space-y-2">
            <Label>첨부파일</Label>
            <FileUpload
              onUpload={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
              multiple
            />
            {attachments.length > 0 && (
              <div className="text-sm text-gray-500">
                {attachments.length}개의 파일이 첨부됨
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/qna')}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '등록 중...' : '질문하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QnaCreate; 