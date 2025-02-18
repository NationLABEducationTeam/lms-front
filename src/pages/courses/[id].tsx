import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '@/types/course';
import { Button } from '@/components/common/ui/button';
import { getCourseDetail } from '@/services/api/courses';
import { useAuth } from '@/hooks/useAuth';

const CourseDetailPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          throw new Error('Course ID is required');
        }
        const courseData = await getCourseDetail(id);
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error}
          </h2>
          <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Course not found
          </h2>
          <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">강의 소개</h2>
            <p className="text-gray-700">{course.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">강의 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">카테고리</p>
                <p className="font-medium">{course.main_category_id}</p>
              </div>
              <div>
                <p className="text-gray-600">강사</p>
                <p className="font-medium">{course.instructor_name}</p>
              </div>
              <div>
                <p className="text-gray-600">강의 유형</p>
                <p className="font-medium">
                  {course.classmode === 'ONLINE' ? '실시간 온라인' : 'VOD'}
                </p>
              </div>
              {course.classmode === 'ONLINE' && course.zoom_link && (
                <div>
                  <p className="text-gray-600">Zoom 링크</p>
                  <a
                    href={course.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {course.zoom_link}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <img
              src={course.thumbnail_url || '/placeholder-course.jpg'}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              수강 신청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage; 