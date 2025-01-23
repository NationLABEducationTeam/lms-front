import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchCoursesByCategory } from '@/store/features/courses/coursesSlice';
import { Button } from '@/components/common/ui/button';
import { Plus } from 'lucide-react';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { MainCategory, Course } from '@/types/course';
import { deleteCourse, listAllCourses } from '@/services/api/courses';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';

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

  // 모든 강의 목록 불러오기
  const fetchAllCourses = async () => {
    setIsLoading(true);
    try {
      const response = await listAllCourses();
      console.log('Fetched courses:', response);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching all courses:', error);
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
    fetchAllCourses();
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
    if (!subCategory) return course.mainCategory === mainCategory;
    return course.mainCategory === mainCategory && course.subCategory === subCategory;
  });

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
  };

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, description, type });
    setToastOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.id);
      // 먼저 토스트 메시지 표시
      showToast(
        "강의 삭제 완료",
        `"${courseToDelete.title}" 강의가 성공적으로 삭제되었습니다.`
      );
      // 강의 목록에서 삭제된 강의 제거
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDelete.id));
      // 대화상자 닫기
      setCourseToDelete(null);
      // 1초 후에 전체 목록 새로고침
      setTimeout(() => {
        fetchAllCourses();
      }, 1000);
    } catch (error) {
      showToast(
        "강의 삭제 실패",
        "강의 삭제 중 오류가 발생했습니다.",
        'error'
      );
      setCourseToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">강의 관리</h1>
            <Button
              onClick={() => navigate('/admin/courses/new')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 강의 등록
            </Button>
          </div>

          <div className="space-y-4">
            <CategorySelector
              mainCategory={mainCategory}
              subCategory={subCategory}
              onMainCategoryChange={handleMainCategoryChange}
              onSubCategoryChange={handleSubCategoryChange}
              className="text-gray-900"
            />

            <div className="mt-6">
              {isLoading ? (
                <div className="text-gray-600">로딩 중...</div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-gray-600">
                            {course.mainCategory} &gt; {course.subCategory}
                          </p>
                        </div>
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
                            onClick={() => handleDeleteClick(course)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog.Root open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a232e] text-white p-6 rounded-lg w-[95vw] max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4">강의 삭제</AlertDialog.Title>
            <AlertDialog.Description className="text-gray-300 mb-6">
              정말로 이 강의를 삭제하시겠습니까?
              <br />
              {courseToDelete?.title}
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialog.Description>
            <div className="flex justify-end space-x-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300">취소</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteConfirm}>삭제</Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            toastMessage.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white`}
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="font-semibold mb-1">{toastMessage.title}</Toast.Title>
          <Toast.Description>{toastMessage.description}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-4 w-96 list-none" />
      </Toast.Provider>
    </div>
  );
};

export default AdminCourses; 