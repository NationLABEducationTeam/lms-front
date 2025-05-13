import { FC, useState } from 'react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Textarea } from '@/components/common/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';
import { BoardFormData } from '@/types/board';

interface BoardFormProps {
  initialData?: BoardFormData;
  onSubmit: (data: BoardFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const BoardForm: FC<BoardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<BoardFormData>(
    initialData || {
      name: '',
      category: 'general',
      status: 'active',
      description: '',
    }
  );

  const handleChange = (
    field: keyof BoardFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">게시판 이름 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="게시판 이름을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">카테고리 *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange('category', value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">일반</SelectItem>
            <SelectItem value="qna">Q&A</SelectItem>
            <SelectItem value="study">스터디</SelectItem>
            <SelectItem value="notice">공지사항</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태 *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange('status', value as 'active' | 'inactive')}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="게시판 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting ? '처리 중...' : initialData ? '수정하기' : '생성하기'}
        </Button>
      </div>
    </form>
  );
};

export default BoardForm; 