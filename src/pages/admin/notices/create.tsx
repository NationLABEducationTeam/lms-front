import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Switch } from '@/components/common/ui/switch';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { NoticeFormData, NoticeCategory } from '@/types/notice';
import { createNotice } from '@/services/api/notices';
import { toast } from 'sonner';
import RichTextEditor from '@/components/common/editor/RichTextEditor';
import { Badge } from '@/components/common/ui/badge';
import { X } from 'lucide-react';

const NOTICE_CATEGORIES: NoticeCategory[] = ['일반', '학사', '장학', '취업', '행사', '기타'];

const CreateNotice: FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    summary: '',
    category: '일반',
    tags: [],
    isImportant: false,
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

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

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(newTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
        }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
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
              <label className="block text-sm font-medium mb-2">요약</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full bg-white/5 h-20"
                placeholder="공지사항의 주요 내용을 간단히 요약해주세요."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">첨테고리</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 rounded-md border border-white/10 px-3 py-2"
              >
                {NOTICE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">태그</label>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="태그를 입력하고 Enter를 눌러주세요"
                  className="w-full bg-white/5"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} className="bg-blue-500/50 text-white px-2 py-1 rounded flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isImportant}
                onCheckedChange={(checked) => setFormData({ ...formData, isImportant: checked })}
              />
              <label className="text-sm font-medium">중요 공지사항</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">내용</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">첨부파일</label>
              <FileUpload onUpload={handleFileUpload} />
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Array.from(formData.attachments).map((file, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
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