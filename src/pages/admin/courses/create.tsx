import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import { Textarea } from '@/components/common/ui/textarea';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { createCourse, getUploadUrls } from '@/services/api/courses';
import { MainCategory } from '@/types/course';
import { useAuth } from '@/hooks/useAuth';

interface CourseFormData {
  title: string;
  description: string;
  mainCategory: MainCategory;
  subCategory: string;
  thumbnail?: File;
  materials?: File[];
}

interface UploadUrlResponse {
  urls: string[];
}

const AdminCourseCreate: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    mainCategory: 'CLOUD',
    subCategory: 'default',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainCategory, setMainCategory] = useState<MainCategory>('CLOUD');
  const [subCategory, setSubCategory] = useState<string>('default');

  const handleMainCategoryChange = (category: MainCategory) => {
    setMainCategory(category);
    setFormData(prev => ({
      ...prev,
      mainCategory: category
    }));
  };

  const handleSubCategoryChange = (category: string) => {
    setSubCategory(category);
    setFormData(prev => ({
      ...prev,
      subCategory: category
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailUpload = (files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        thumbnail: files[0]
      }));
    }
  };

  const handleMaterialsUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      materials: files
    }));
  };

  const removeMaterial = (index: number) => {
    if (formData.materials) {
      const newMaterials = [...formData.materials];
      newMaterials.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        materials: newMaterials
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 소분류 검증
    if (!formData.subCategory.trim()) {
      setError('소분류를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 강의 생성 API 호출
      await createCourse({
        title: formData.title,
        description: formData.description,
        mainCategory: formData.mainCategory as MainCategory,
        subCategory: formData.subCategory,
        instructor: user?.email || ''
      });

      navigate('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      setError('강의 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#232f3e] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">새 강의 생성</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">카테고리</label>
            <CategorySelector
              selectedMain={mainCategory}
              selectedSub={subCategory}
              onMainChange={handleMainCategoryChange}
              onSubChange={handleSubCategoryChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">강의 제목</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="강의 제목을 입력하세요"
              className="bg-[#1a232e] border-gray-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">강의 설명</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="강의 설명을 입력하세요"
              className="bg-[#1a232e] border-gray-700 min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">썸네일 이미지</label>
            <FileUpload
              onUpload={handleThumbnailUpload}
              accept="image/*"
              maxFiles={1}
              className="bg-[#1a232e] border-gray-700"
            />
            {formData.thumbnail && (
              <div className="mt-2">
                <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail: undefined }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">강의 자료</label>
            <FileUpload
              onUpload={handleMaterialsUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              maxFiles={10}
              multiple
              className="bg-[#1a232e] border-gray-700"
            />
            {formData.materials && formData.materials.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.materials.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#1a232e] p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
              className="border-gray-700 text-gray-300 hover:bg-[#2c3b4e]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '생성 중...' : '강의 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCourseCreate; 