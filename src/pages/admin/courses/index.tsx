import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { MainCategory, Course } from '@/types/course';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';
import { useGetPublicCoursesQuery, useDeleteCourseMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';

const AdminCourses: FC = () => {
  const navigate = useNavigate();
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: courses = [], isLoading, error } = useGetPublicCoursesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const filteredCourses = courses.filter(course => {
    const matchesMainCategory = !selectedMainCategory || course.main_category_id === selectedMainCategory;
    const matchesSubCategory = !selectedSubCategory || course.sub_category_id.toLowerCase().includes(selectedSubCategory.toLowerCase());
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMainCategory && matchesSubCategory && matchesSearch;
  });

  const handleDeleteClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourseId) return;

    try {
      await deleteCourse(selectedCourseId).unwrap();
      toast.success('강의가 성공적으로 삭제되었습니다.');
    } catch (error) {
      toast.error('강의 삭제에 실패했습니다.');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCourseId(null);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">강의 관리</h1>
            <p className="text-gray-500">강의를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Button
            onClick={() => navigate('/admin/courses/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 강의 만들기
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-64">
            <CategorySelector
              selectedMain={selectedMainCategory}
              selectedSub={selectedSubCategory}
              onMainChange={setSelectedMainCategory}
              onSubChange={setSelectedSubCategory}
            />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="강의 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            강의 목록을 불러오는데 실패했습니다.
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 강의가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/courses/${course.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(course.id);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/courses/${course.id}/edit`);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                강의 삭제
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-500 mb-4">
                정말로 이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialog.Description>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default AdminCourses; 