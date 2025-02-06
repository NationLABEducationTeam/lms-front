import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchCoursesByCategory } from '@/store/features/courses/coursesSlice';
import { Button } from '@/components/common/ui/button';
import { Plus, Search, Trash2, Edit2, ChevronRight, BookOpen } from 'lucide-react';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { MainCategory, Course } from '@/types/course';
import { deleteCourse, listPublicCourses } from '@/services/api/courses';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';

const AdminCourses: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.courses);

  const [mainCategory, setMainCategory] = useState<MainCategory | ''>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 모든 강의 목록 불러오기
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const courses = await listPublicCourses();
      setCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast(
        "강의 목록 로딩 실패",
        "강의 목록을 불러오는데 실패했습니다.",
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
    fetchCourses();
  }, [dispatch]);

  const handleMainCategoryChange = (category: MainCategory) => {
    setMainCategory(category);
    setSubCategory('');
    dispatch(fetchCoursesByCategory({ mainCategory: category, subCategory: '' }));
  };

  const handleSubCategoryChange = (category: string) => {
    setSubCategory(category);
    if (mainCategory) {
      dispatch(fetchCoursesByCategory({ mainCategory, subCategory: category }));
    }
  };

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    if (!mainCategory) return true;
    if (!subCategory) return course.main_category_id === mainCategory;
    return course.main_category_id === mainCategory && course.sub_category_id === subCategory;
  });

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, description, type });
    setToastOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setIsLoading(true);
      await deleteCourse(courseToDelete.id);
      
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDelete.id));
      
      showToast(
        "강의 삭제 완료",
        `"${courseToDelete.title}" 강의가 성공적으로 삭제되었습니다.`
      );
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast(
        "강의 삭제 실패",
        "강의 삭제 중 오류가 발생했습니다.",
        'error'
      );
    } finally {
      setIsLoading(false);
      setCourseToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">강의 관리</h1>
            <p className="mt-1 text-gray-500">
              전체 {courses.length}개의 강의가 등록되어 있습니다
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/admin/courses/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 강의 등록
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Filters */}
          <Card className="p-6 bg-white shadow-sm border-0">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">필터</h2>
              <CategorySelector
                selectedMain={mainCategory}
                selectedSub={subCategory}
                onMainChange={handleMainCategoryChange}
                onSubChange={handleSubCategoryChange}
                className="text-gray-900"
              />
            </div>
          </Card>

          {/* Course List */}
          <Card className="bg-white shadow-sm border-0 divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">강의 목록을 불러오는 중...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">등록된 강의가 없습니다</h3>
                <p className="mt-1 text-gray-500">새로운 강의를 등록해주세요.</p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate('/admin/courses/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 강의 등록
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${course.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                              course.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {course.level === 'BEGINNER' ? '입문' :
                             course.level === 'INTERMEDIATE' ? '중급' : '고급'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                          <span>{course.main_category_id}</span>
                          <ChevronRight className="w-4 h-4" />
                          <span>{course.sub_category_id}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {course.description || '설명이 없습니다.'}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();  // 이벤트 전파 중단
                            navigate(`/admin/courses/${course.id}/edit`);
                          }}
                          className="text-gray-700 border-gray-300"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();  // 이벤트 전파 중단
                            handleDeleteClick(course);
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[95vw] max-w-md">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              강의 삭제
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mb-6">
              <p>정말로 다음 강의를 삭제하시겠습니까?</p>
              <p className="font-medium text-gray-900 mt-2">{courseToDelete?.title}</p>
              <p className="text-red-600 text-sm mt-4">이 작업은 되돌릴 수 없습니다.</p>
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-300"
                  onClick={() => {
                    setCourseToDelete(null);
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  취소
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? '삭제 중...' : '삭제'}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Toast Notifications */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            toastMessage.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white max-w-md`}
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="font-semibold mb-1">{toastMessage.title}</Toast.Title>
          <Toast.Description>{toastMessage.description}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-4 w-full max-w-md list-none" />
      </Toast.Provider>
    </div>
  );
};

export default AdminCourses; 