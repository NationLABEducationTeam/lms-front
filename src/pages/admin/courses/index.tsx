import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchSubCategories, fetchCoursesByCategory } from '@/store/features/courses/coursesSlice';
import { Button } from '@/components/common/ui/button';
import { Plus } from 'lucide-react';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { MainCategory, SubCategory, Course } from '@/types/course';

const AdminCourses: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, subCategories, courses, loading, error } = useSelector((state: RootState) => state.courses);

  const [mainCategory, setMainCategory] = useState<MainCategory | ''>('');
  const [subCategory, setSubCategory] = useState<SubCategory | ''>('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleMainCategoryChange = (category: MainCategory | '') => {
    setMainCategory(category);
  };

  const handleSubCategoryChange = (category: SubCategory | '') => {
    setSubCategory(category);
    if (mainCategory && category) {
      dispatch(fetchCoursesByCategory({ mainCategory, subCategory: category }));
    }
  };

  return (
    <div className="min-h-screen bg-[#232f3e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">강의 관리</h1>
          <Button
            onClick={() => navigate('/admin/courses/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 강의
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a232e] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">카테고리별 강의 목록</h2>
            <CategorySelector
              selectedMain={mainCategory}
              selectedSub={subCategory}
              onMainChange={handleMainCategoryChange}
              onSubChange={handleSubCategoryChange}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(courses as Course[]).map((course) => (
                <div
                  key={course.id}
                  className="bg-[#1a232e] rounded-lg p-6 hover:bg-[#2c3b4e] transition-colors"
                >
                  <div className="aspect-video bg-gray-700 rounded-lg mb-4">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                      className="border-gray-700 text-gray-300 hover:bg-[#2c3b4e]"
                    >
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // TODO: 삭제 기능 구현
                        console.log('Delete course:', course.id);
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses; 