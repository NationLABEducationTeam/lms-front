import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createCourse } from '@/services/api/courses';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Alert } from '@/components/common/ui/alert';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/common/ui/select';
import { MainCategory, SubCategory } from '@/types/category';

interface CourseFormData {
  name: string;
  title: string;
  description: string;
  zoom_link?: string;
  thumbnail?: File;
  category: MainCategory;
  subcategory: SubCategory;
}

const CreateCoursePage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    title: '',
    description: '',
    category: 'PROGRAMMING' as MainCategory,
    subcategory: 'FRONTEND' as SubCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      await createCourse({
        name: formData.name,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        instructor_id: user.user_id,
      });

      navigate('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : '강의 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">새 강의 생성</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">강의 코드</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="title">강의 제목</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">강의 설명</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full min-h-[100px] p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <Label htmlFor="zoom_link">Zoom 링크</Label>
            <Input
              id="zoom_link"
              name="zoom_link"
              value={formData.zoom_link || ''}
              onChange={handleInputChange}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div>
            <Label htmlFor="thumbnail">썸네일 이미지</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="mt-1"
            />
            {formData.thumbnail && (
              <p className="mt-2 text-sm text-gray-600">
                선택된 파일: {formData.thumbnail.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Select value={formData.category}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROGRAMMING">프로그래밍</SelectItem>
                <SelectItem value="DESIGN">디자인</SelectItem>
                <SelectItem value="BUSINESS">비즈니스</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory">서브 카테고리</Label>
            <Select value={formData.subcategory}>
              <SelectTrigger>
                <SelectValue placeholder="서브 카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRONTEND">프론트엔드</SelectItem>
                <SelectItem value="BACKEND">백엔드</SelectItem>
                <SelectItem value="MOBILE">모바일</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '생성 중...' : '강의 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage; 