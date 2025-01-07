import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { NoticeFormData } from '@/types/notice';
import { createNotice } from '@/services/api/notices';
import { toast } from 'sonner';
import RichTextEditor from '@/components/common/editor/RichTextEditor';

const CreateNotice: FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createNotice(formData);
      toast.success('공지사항이 등록되었습니다.');
      navigate('/admin/notices');
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      toast.error('공지사항 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (fileList: FileList) => {
    const files = Array.from(fileList);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h1 className="text-2xl font-bold mb-6">공지사항 작성</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">제목</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">내용</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">첨부파일</label>
              <FileUpload onUpload={handleFileUpload} />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/notices')}
                className="bg-white/10 hover:bg-white/20"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNotice; 