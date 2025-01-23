import { FC, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Course } from '@/types/course';
import { getCourseDetail } from '@/services/api/courses';
import { enrollInCourse } from '@/services/api/enrollments';
import { PlayCircle, Book, User, Gift, HelpCircle } from 'lucide-react';
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

  // Refs for each section
  const introductionRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const sections: Section[] = [
    { id: 'introduction', title: '강의소개', ref: introductionRef },
    { id: 'curriculum', title: '커리큘럼', ref: curriculumRef },
    { id: 'instructor', title: '강사소개', ref: instructorRef },
    { id: 'services', title: '부가서비스', ref: servicesRef },
    { id: 'faq', title: 'FAQ', ref: faqRef },
  ];

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseData = await getCourseDetail(id);
        setCourse(courseData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading course details:', error);
        setError('강의 정보를 불러오는데 실패했습니다.');
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
      alert("수강신청에 필요한 정보가 없습니다.");
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
        {course?.thumbnail && (
          <div className="absolute inset-0 opacity-10">
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="inline-flex items-center bg-blue-600 rounded-full px-3 py-1 text-sm mb-4">
                <span>{course?.mainCategory}</span>
                <span className="mx-2">•</span>
                <span>{course?.subCategory}</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course?.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course?.description}</p>
              <div className="flex items-center text-sm">
                <img 
                  src={course?.instructorImage || '/default-avatar.png'} 
                  alt={course?.instructor} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span>{course?.instructor}</span>
              </div>
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
                {section.id === 'curriculum' && <PlayCircle className="w-4 h-4 mr-2" />}
                {section.id === 'instructor' && <User className="w-4 h-4 mr-2" />}
                {section.id === 'services' && <Gift className="w-4 h-4 mr-2" />}
                {section.id === 'faq' && <HelpCircle className="w-4 h-4 mr-2" />}
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 mb-24">
        {/* Course Introduction */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">강의 소개</h2>
          <div className="prose prose-slate max-w-none">
            <p>{course?.description}</p>
          </div>
        </div>

        {/* Recommended For Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">이런 분께 추천드려요</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">클라우드 입문자</h3>
                <p className="text-slate-600">AWS 클라우드를 처음 시작하시는 분들에게 적합한 기초 과정입니다.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">IT 기업 취업 준비생</h3>
                <p className="text-slate-600">클라우드 엔지니어로 취업을 준비하시는 분들을 위한 실무 중심 커리큘럼입니다.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">현직 개발자</h3>
                <p className="text-slate-600">클라우드 기술을 활용한 인프라 구축 및 운영 능력을 향상시키고 싶은 개발자분들께 추천드립니다.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">IT 관리자</h3>
                <p className="text-slate-600">클라우드 도입을 고려하는 기업의 IT 관리자분들을 위한 실용적인 내용을 다룹니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Section */}
        <div ref={curriculumRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <PlayCircle className="w-6 h-6 mr-2" />
            커리큘럼
          </h2>
          <div className="space-y-4">
            {course?.lessons?.map((lesson, index) => (
              <div key={lesson.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">{lesson.title}</h3>
                      <p className="text-gray-600">{lesson.content}</p>
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        {lesson.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Section */}
        <div ref={instructorRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <User className="w-6 h-6 mr-2" />
            강사소개
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-6">
              {course?.instructorImage && (
                <img
                  src={course.instructorImage}
                  alt={course.instructor}
                  className="w-auto max-w-[200px] rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-medium mb-3">{course?.instructor}</h3>
                <p className="text-gray-600 leading-relaxed">{course?.instructorBio || '강사 소개가 준비중입니다.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services Section */}
        <div ref={servicesRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-2" />
            부가서비스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                수료증 발급
              </h3>
              <p className="text-gray-600">강의 수료 후 수료증을 발급받을 수 있습니다.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                실습 자료 제공
              </h3>
              <p className="text-gray-600">강의에 필요한 실습 자료를 제공합니다.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div ref={faqRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2" />
            FAQ
          </h2>
          <div className="space-y-4">
            {course?.faqs?.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button className="w-full text-left px-6 py-4 focus:outline-none hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Purchase Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-blue-600 rounded-full shadow-lg py-3 px-6 flex items-center space-x-4 hover:bg-blue-700 transition-colors">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-100">수강료</span>
            <span className="text-xl font-bold text-white">{(course?.price || 0).toLocaleString()}원</span>
          </div>
          <button 
            onClick={handleEnrollment}
            disabled={enrolling}
            className={`bg-white text-blue-600 px-8 py-2 rounded-full font-medium transition-colors ${
              enrolling ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-50'
            }`}
          >
            {enrolling ? '처리중...' : '수강신청'}
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
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