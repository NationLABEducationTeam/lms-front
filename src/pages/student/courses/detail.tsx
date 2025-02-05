import { FC, useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Course } from '@/types/course';
import { getCourseDetail } from '@/services/api/courses';
import { enrollInCourse } from '@/services/api/enrollments';
import { PlayCircle, Book, User, Gift, HelpCircle, Clock, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/ui/button';

interface Section {
  id: string;
  title: string;
  ref: React.RefObject<HTMLDivElement>;
}

const CourseDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState('introduction');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Refs for each section
  const introductionRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const sections: Section[] = [
    { id: 'introduction', title: '강의소개', ref: introductionRef },
    { id: 'instructor', title: '강사소개', ref: instructorRef },
    { id: 'services', title: '부가서비스', ref: servicesRef },
  ];

  // 페이지 진입 시 스크롤 위치 초기화
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseData = await getCourseDetail(id);
        // console.log('Loaded course data:', courseData);
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course details:', error);
        setError(error instanceof Error ? error.message : '강의 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.ref.current) {
      section.ref.current.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnrollment = async () => {
    if (!course?.id || !user?.cognito_user_id) {
      alert("로그인을 먼저 해주세요");
      window.location.href = '/auth';
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse({
        courseId: course.id,
        userId: user.cognito_user_id,
        enrolledAt: new Date().toISOString()
      });

      alert("성공적으로 수강신청이 완료되었습니다.");
      navigate('/courses');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error instanceof Error ? error.message : "수강신청 중 오류가 발생했습니다.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-gray-600 mb-4">{error || '강의를 찾을 수 없습니다.'}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Course Header with Background Image */}
      <div className="bg-[#232f3e] text-white relative overflow-hidden">
        {course?.thumbnail_url && (
          <div className="absolute inset-0 opacity-10">
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/90 text-white text-sm rounded-full backdrop-blur-sm">
                  {course?.main_category_name}
                </span>
                <span className="px-3 py-1 bg-blue-400/90 text-white text-sm rounded-full backdrop-blur-sm">
                  {course?.sub_category_name}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course?.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course?.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">강사</p>
                    <p className="font-medium">{course?.instructor_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">난이도</p>
                    <p className="font-medium">
                      {course?.level === 'BEGINNER' ? '초급' : course?.level === 'INTERMEDIATE' ? '중급' : '고급'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">등록일</p>
                    <p className="font-medium">{new Date(course?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 bg-white shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`py-4 px-2 border-b-2 whitespace-nowrap flex items-center ${
                  activeSection === section.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {section.id === 'introduction' && <Book className="w-4 h-4 mr-2" />}
                {section.id === 'instructor' && <User className="w-4 h-4 mr-2" />}
                {section.id === 'services' && <Gift className="w-4 h-4 mr-2" />}
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Introduction */}
        <div ref={introductionRef} className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">강의 소개</h2>
          <div className="prose prose-slate max-w-none">
            <p>{course?.description}</p>
          </div>
        </div>

        {/* Instructor Section */}
        <div ref={instructorRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <User className="w-6 h-6 mr-2" />
            강사소개
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start space-x-6">
              <img
                src={course.instructor_image || '/default-avatar.png'}
                alt={course.instructor_name}
                className="w-32 h-32 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-xl font-medium mb-4">{course.instructor_name}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {course.instructor_bio || '강사 소개가 준비중입니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services Section */}
        <div ref={servicesRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Gift className="w-6 h-6 mr-2" />
            부가서비스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-3">무제한 수강</h3>
              <p className="text-gray-600">기간 제한 없이 무제한으로 수강할 수 있습니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-3">학습 자료</h3>
              <p className="text-gray-600">강의에 필요한 학습 자료를 제공합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-3">질문 답변</h3>
              <p className="text-gray-600">학습 중 궁금한 점을 질문하고 답변받을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Purchase Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg py-4 px-6 flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-sm text-blue-200">수강료</span>
            <span className="text-2xl font-bold text-white">
              {course.price ? 
                `${Number(course.price).toLocaleString('ko-KR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}원` 
                : '무료'}
            </span>
          </div>
          <button 
            onClick={handleEnrollment}
            disabled={enrolling || course.status !== 'PUBLISHED'}
            className={`
              px-8 py-3 rounded-xl font-medium text-base
              ${enrolling || course.status !== 'PUBLISHED'
                ? 'bg-blue-400 text-blue-100 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50 transition-colors'}
            `}
          >
            {enrolling ? '처리중...' : 
             course.status !== 'PUBLISHED' ? '준비중' : 
             '수강신청하기'}
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 border border-gray-200"
          aria-label="위로 가기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CourseDetailPage; 