import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import { Textarea } from '@/components/common/ui/textarea';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { MainCategory, CourseLevel } from '@/types/course';
import { useCreateCourseMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Card } from "@/components/common/ui/card";
import { ArrowLeft, Upload } from 'lucide-react';

interface CourseFormData {
  title: string;
  description: string;
  main_category_id: MainCategory | null;
  sub_category_id: string;
  thumbnail: File | null;
  level: CourseLevel;
  price: number;
}

const AdminCourseCreate: FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    main_category_id: null,
    sub_category_id: '',
    thumbnail: null,
    level: 'BEGINNER',
    price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleThumbnailUpload = (files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        thumbnail: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        thumbnail: null
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 필수 필드 검증
    if (!formData.main_category_id) {
      setError('대분류를 선택해주세요.');
      return;
    }

    if (!formData.sub_category_id.trim()) {
      setError('소분류를 입력해주세요.');
      return;
    }

    try {
      await createCourse({
        title: formData.title,
        description: formData.description,
        main_category_id: formData.main_category_id,
        sub_category_id: formData.sub_category_id,
        thumbnail: formData.thumbnail,
        level: formData.level,
        price: formData.price
      }).unwrap();

      toast.success('강의가 성공적으로 생성되었습니다.');
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('강의 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            목록으로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">새 강의 생성</h1>
            <p className="text-gray-500 mt-1">새로운 강의의 정보를 입력해주세요</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
                {/* Basic Information */}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        강의 제목
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="강의 제목을 입력하세요"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리
                      </label>
                      <CategorySelector
                        selectedMain={formData.main_category_id}
                        selectedSub={formData.sub_category_id}
                        onMainChange={(category) => setFormData(prev => ({ ...prev, main_category_id: category }))}
                        onSubChange={(value) => setFormData(prev => ({ ...prev, sub_category_id: value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        강의 설명
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="강의에 대한 상세한 설명을 입력하세요"
                        className="w-full min-h-[200px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        난이도
                      </label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: CourseLevel) => 
                          setFormData(prev => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="난이도를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">입문</SelectItem>
                          <SelectItem value="INTERMEDIATE">중급</SelectItem>
                          <SelectItem value="ADVANCED">고급</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        가격
                      </label>
                      <div className="relative">
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="가격을 입력하세요"
                          className="w-full pl-8"
                          min="0"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="px-6 py-4 bg-red-50">
                    <div className="flex items-center text-red-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/courses')}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isLoading ? '생성 중...' : '강의 생성'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Thumbnail Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">썸네일</h2>
              <div className="space-y-4">
                <FileUpload
                  onUpload={handleThumbnailUpload}
                  accept="image/*"
                  maxFiles={1}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                />
                
                {formData.thumbnail && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  고품질의 썸네일 이미지를 업로드하세요. 권장 크기는 1290 x 960 픽셀입니다.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCreate; 