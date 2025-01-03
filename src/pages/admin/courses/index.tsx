import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories } from '@/store/features/courses/coursesSlice';
import { CourseList } from '@/components/courses/CourseList';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/ui/button';

const AdminCoursesPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { courses, loading, error } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    if (user) {
      dispatch(fetchCategories());
    }
  }, [dispatch, user]);

  const handleJoinClass = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleEdit = () => {
    // 수정 로직 구현
  };

  const handleDelete = () => {
    // 삭제 로직 구현
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">강의 관리</h1>
        <Button onClick={() => navigate('/admin/courses/create')}>
          새 강의 생성
        </Button>
      </div>
      
      <CourseList
        courses={courses}
        userRole="ADMIN"
        onJoinClass={handleJoinClass}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminCoursesPage; 