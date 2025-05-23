import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useGetCourseByIdQuery, useUpdateCourseMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { UpdateCourseRequest } from '@/services/api/courseApi';
import { CourseForm } from '@/components/courses/CourseForm';
import { CATEGORY_MAPPING, MainCategoryId, CourseLevel, CourseStatus } from '@/types/course';

const EditCourse: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useGetCourseByIdQuery(id!);
  const [updateCourse] = useUpdateCourseMutation();

  const handleSubmit = async (data: {
    title: string;
    description: string;
    main_category_id: string;
    sub_category_id: string;
    price: number;
    level: CourseLevel;
    status?: CourseStatus;
    zoom_link?: string;
  }) => {
    try {
      // main_category_id를 MainCategory 객체로 변환
      const categoryId = data.main_category_id as MainCategoryId;
      const updateData: UpdateCourseRequest = {
        title: data.title,
        description: data.description,
        main_category_id: {
          id: categoryId,
          name: CATEGORY_MAPPING[categoryId as keyof typeof CATEGORY_MAPPING],
          sub_categories: []
        },
        sub_category_id: data.sub_category_id,
        price: data.price,
        level: data.level,
        status: data.status,
        zoom_link: data.zoom_link
      };

      await updateCourse({ id: id!, body: updateData }).unwrap();
      toast.success('강의가 성공적으로 수정되었습니다.');
      navigate('/admin/courses');
    } catch (error) {
      toast.error('강의 수정에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12 text-red-600">
        강의 정보를 불러오는데 실패했습니다.
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">강의 수정</h1>
            <p className="text-gray-500">강의 정보를 수정할 수 있습니다.</p>
          </div>
        </div>

        <CourseForm
          initialValues={{
            title: course.title,
            description: course.description,
            main_category_id: course.main_category_id,
            sub_category_id: course.sub_category_id,
            level: course.level,
            price: course.price,
            status: course.status,
            zoom_link: course.zoom_link
          }}
          onSubmit={handleSubmit}
          submitButtonText="수정하기"
        />
      </div>
    </div>
  );
};

export default EditCourse; 