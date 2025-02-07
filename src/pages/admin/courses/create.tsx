import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCreateCourseMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { CourseForm } from '@/components/courses/CourseForm';
import { CreateCourseRequest } from '@/services/api/courseApi';

const CreateCourse: FC = () => {
  const navigate = useNavigate();
  const [createCourse] = useCreateCourseMutation();

  const handleSubmit = async (data: CreateCourseRequest) => {
    try {
      const course = await createCourse(data).unwrap();
      toast.success('강의가 성공적으로 생성되었습니다.');
      navigate(`/admin/courses/${course.id}`);
    } catch (error) {
      toast.error('강의 생성에 실패했습니다.');
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">새 강의 만들기</h1>
            <p className="text-gray-500">새로운 강의를 생성할 수 있습니다.</p>
          </div>
        </div>

        <CourseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateCourse; 