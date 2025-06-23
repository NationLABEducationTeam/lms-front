import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Plus, Search, Trash2, Edit2, BookOpen, Users, Calendar, AlertCircle } from 'lucide-react';
import { CategorySelector } from '@/components/courses/CategorySelector';
import { MainCategory, Course, MainCategoryId, CourseStatus } from '@/types/course';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';
import { useGetPublicCoursesQuery, useDeleteCourseMutation, useToggleCourseStatusMutation } from '@/services/api/courseApi';
import { getCourseEnrollments } from '@/services/api/enrollments';
import { toast } from 'sonner';
import { Badge } from '@/components/common/ui/badge';
import { Switch } from '@/components/common/ui/switch';

const AdminCourses: FC = () => {
  const navigate = useNavigate();
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: courses = [], isLoading, error } = useGetPublicCoursesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [toggleStatus] = useToggleCourseStatusMutation();

  const EnrollmentCount: FC<{ courseId: string }> = ({ courseId }) => {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCount = async () => {
        try {
          const response = await getCourseEnrollments(courseId);
          if (response.success && response.data) {
            setCount(response.data.enrollments.length);
          } else {
            // This case might not be hit if the function throws on error, but good practice.
            setCount(0);
          }
        } catch (error) {
          console.error(`Failed to fetch enrollment count for course ${courseId}`, error);
          setCount(0);
        } finally {
          setLoading(false);
        }
      };

      fetchCount();
    }, [courseId]);

    if (loading) {
      return <span className="text-sm text-gray-500">불러오는 중...</span>;
    }

    return <span>{count ?? 0}명 수강 중</span>;
  };

  const handleStatusToggle = async (courseId: string, currentStatus: CourseStatus) => {
    try {
      await toggleStatus(courseId).unwrap();
      toast.success(`강의가 ${currentStatus === CourseStatus.PUBLISHED ? '비공개' : '공개'}로 변경되었습니다.`);
    } catch (error) {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesMainCategory = !selectedMainCategory || course.main_category_id === selectedMainCategory.id;
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
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">강의 관리</h1>
              <p className="text-gray-500">총 {filteredCourses.length}개의 강의가 등록되어 있습니다.</p>
            </div>
            <Button
              onClick={() => navigate('/admin/courses/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 hover:shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 강의 만들기
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <CategorySelector
                selectedMain={selectedMainCategory}
                selectedSub={selectedSubCategory}
                onMainChange={setSelectedMainCategory}
                onSubChange={setSelectedSubCategory}
                className="bg-white rounded-lg shadow-sm"
              />
            </div>
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="강의 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-12 text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 강의 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-gray-500">강의 목록을 불러오는데 실패했습니다.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 강의가 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 강의를 만들어 시작해보세요</p>
            <Button
              onClick={() => navigate('/admin/courses/create')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 강의 만들기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-white border-0 shadow-sm"
              >
                <div className="flex items-start gap-6">
                  {/* 썸네일 */}
                  <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 강의 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                        >
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {course.status === CourseStatus.PUBLISHED ? '공개' : '비공개'}
                          </span>
                          <Switch
                            checked={course.status === CourseStatus.PUBLISHED}
                            onCheckedChange={() => handleStatusToggle(course.id, course.status)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/courses/${course.id}/edit`);
                            }}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourseId(course.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <EnrollmentCount courseId={course.id} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                강의 삭제
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-500 mb-6">
                정말로 이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialog.Description>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                  className="hover:bg-gray-50"
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
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