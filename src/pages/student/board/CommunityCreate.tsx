import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import RichTextEditor from '@/components/common/editor/RichTextEditor';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { useAuth } from '@/hooks/useAuth';
import { createCommunityPost } from '@/services/api/community';
import { toast } from 'sonner';

const CommunityCreate: FC = () => {
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
      
      await createCommunityPost({
        title,
        content,
        author: user?.name || '익명',
        attachments
      });

      toast.success('게시글이 작성되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      toast.error('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>자유게시판 글쓰기</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>내용</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label>첨부파일</Label>
            <FileUpload
              onUpload={handleFileUpload}
              accept="*/*"
              multiple
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/community')}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '작성 중...' : '작성하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunityCreate; 