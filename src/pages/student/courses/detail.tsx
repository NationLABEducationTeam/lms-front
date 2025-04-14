import { FC, useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Course } from '@/types/course';
import { getCourseDetail } from '@/services/api/courses';
import { enrollInCourse } from '@/services/api/enrollments';
import { PlayCircle, Book, User, Gift, HelpCircle, Clock, Target, ShoppingCart, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/ui/button';
import { toast } from 'sonner';
import { addToCart, addToWishlist, isInCart, isInWishlist } from '@/services/api/courseInteractions';

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
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartAnimating, setCartAnimating] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const wishlistButtonRef = useRef<HTMLButtonElement>(null);

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
  
  // 장바구니, 위시리스트 상태 확인
  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!id || !user?.cognito_user_id) return;
      
      try {
        // 장바구니 확인
        const cartResult = await isInCart(user.cognito_user_id, id);
        if (cartResult.success) {
          setInCart(cartResult.exists);
        }
        
        // 위시리스트 확인
        const wishlistResult = await isInWishlist(user.cognito_user_id, id);
        if (wishlistResult.success) {
          setInWishlist(wishlistResult.exists);
        }
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };
    
    checkUserInteractions();
  }, [id, user]);

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
  
  // 장바구니 추가 핸들러
  const handleAddToCart = async () => {
    console.log("장바구니 버튼 눌러짐", new Date().toISOString());
    console.log("학생 ID:", user?.cognito_user_id, "과목 ID:", id);
    
    if (!id || !user?.cognito_user_id || !course) {
      console.log("사용자 인증 정보 없음", user);
      toast('로그인이 필요합니다', {
        description: '로그인 후 이용해주세요'
      });
      return;
    }
    
    if (inCart) {
      console.log("이미 장바구니에 있음");
      // 이미 장바구니에 있어도 애니메이션 효과 제공
      setCartAnimating(true);
      if (cartButtonRef.current) {
        cartButtonRef.current.classList.add('animate-bounce');
        setTimeout(() => {
          if (cartButtonRef.current) {
            cartButtonRef.current.classList.remove('animate-bounce');
          }
          setCartAnimating(false);
        }, 1000);
      }
      
      toast('이미 장바구니에 있습니다', {
        description: '장바구니에서 확인해주세요'
      });
      return;
    }
    
    try {
      console.log("장바구니 추가 시작 - 학생:", user.cognito_user_id, "과목:", id);
      setCartLoading(true);
      
      // ID만 가져와서 요청 - 불필요한 데이터 전송 방지
      const simpleCourse = {
        id: course.id,
        title: course.title,
        price: course.price
      };
      
      console.log("장바구니에 추가하는 단순화된 데이터:", simpleCourse);
      
      const result = await addToCart(user.cognito_user_id, simpleCourse);
      
      if (result.success) {
        setInCart(true);
        
        // 성공 애니메이션
        setCartAnimating(true);
        if (cartButtonRef.current) {
          cartButtonRef.current.classList.add('animate-bounce');
          setTimeout(() => {
            if (cartButtonRef.current) {
              cartButtonRef.current.classList.remove('animate-bounce');
            }
            setCartAnimating(false);
          }, 1000);
        }
        
        toast('장바구니에 추가되었습니다', {
          description: '장바구니에서 확인해보세요'
        });
      } else {
        toast('장바구니 추가 실패', {
          description: '잠시 후 다시 시도해주세요'
        });
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      toast('장바구니 추가 실패', {
        description: '잠시 후 다시 시도해주세요'
      });
    } finally {
      setCartLoading(false);
    }
  };

  // 관심목록 추가 핸들러
  const handleAddToWishlist = async () => {
    console.log("위시리스트 버튼 눌러짐", new Date().toISOString());
    console.log("학생 ID:", user?.cognito_user_id, "과목 ID:", id);
    
    if (!id || !user?.cognito_user_id || !course) {
      console.log("사용자 인증 정보 없음", user);
      toast('로그인이 필요합니다', {
        description: '로그인 후 이용해주세요'
      });
      return;
    }
    
    if (inWishlist) {
      console.log("이미 위시리스트에 있음");
      // 이미 관심목록에 있어도 애니메이션 효과 제공
      setWishlistAnimating(true);
      if (wishlistButtonRef.current) {
        wishlistButtonRef.current.classList.add('animate-heartbeat');
        setTimeout(() => {
          if (wishlistButtonRef.current) {
            wishlistButtonRef.current.classList.remove('animate-heartbeat');
          }
          setWishlistAnimating(false);
        }, 1500);
      }
      
      toast('이미 관심목록에 있습니다', {
        description: '관심목록에서 확인해주세요'
      });
      return;
    }
    
    try {
      console.log("위시리스트 추가 시작 - 학생:", user.cognito_user_id, "과목:", id);
      setWishlistLoading(true);
      
      // ID만 가져와서 요청 - 불필요한 데이터 전송 방지
      const simpleCourse = {
        id: course.id,
        title: course.title,
        price: course.price
      };
      
      console.log("관심목록에 추가하는 단순화된 데이터:", simpleCourse);
      
      const result = await addToWishlist(user.cognito_user_id, simpleCourse);
      
      if (result.success) {
        setInWishlist(true);
        
        // 성공 애니메이션
        setWishlistAnimating(true);
        if (wishlistButtonRef.current) {
          wishlistButtonRef.current.classList.add('animate-heartbeat');
          setTimeout(() => {
            if (wishlistButtonRef.current) {
              wishlistButtonRef.current.classList.remove('animate-heartbeat');
            }
            setWishlistAnimating(false);
          }, 1500);
        }
        
        toast('관심목록에 추가되었습니다', {
          description: '관심목록에서 확인해보세요'
        });
      } else {
        toast('관심목록 추가 실패', {
          description: '잠시 후 다시 시도해주세요'
        });
      }
    } catch (error) {
      console.error('관심목록 추가 오류:', error);
      toast('관심목록 추가 실패', {
        description: '잠시 후 다시 시도해주세요'
      });
    } finally {
      setWishlistLoading(false);
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
                  {course?.main_category_id}
                </span>
                <span className="px-3 py-1 bg-blue-400/90 text-white text-sm rounded-full backdrop-blur-sm">
                  {course?.sub_category_id}
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
                  {course.instructor_bio || '강사 소개가 준비중입니다!!!!!!.'}
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
          <div className="flex space-x-2">
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
            
            {/* 장바구니 버튼 */}
            <button
              ref={cartButtonRef}
              onClick={() => {
                console.log("장바구니 버튼 클릭 직접 이벤트");
                handleAddToCart();
              }}
              disabled={cartLoading}
              className={`
                px-4 py-2 rounded-xl flex items-center justify-center
                transform hover:scale-105 active:scale-95
                transition-all duration-200 ease-in-out
                ${inCart 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                ${cartLoading ? 'animate-pulse' : ''}
                relative
              `}
            >
              {cartLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : inCart ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-xs font-semibold">추가됨</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-xs font-semibold">장바구니</span>
                </div>
              )}
              {cartAnimating && (
                <span className="absolute inset-0 rounded-xl border-2 border-indigo-400 animate-ping opacity-75"></span>
              )}
            </button>
            
            {/* 관심목록 버튼 */}
            <button
              ref={wishlistButtonRef}
              onClick={() => {
                console.log("위시리스트 버튼 클릭 직접 이벤트");
                handleAddToWishlist();
              }}
              disabled={wishlistLoading}
              className={`
                px-4 py-2 rounded-xl flex items-center justify-center
                transform hover:scale-105 active:scale-95
                transition-all duration-200 ease-in-out
                ${inWishlist 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-pink-600 text-white hover:bg-pink-700'}
                ${wishlistLoading ? 'animate-pulse' : ''}
                relative
              `}
            >
              {wishlistLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
                  <span className="text-xs font-semibold">{inWishlist ? '저장됨' : '관심목록'}</span>
                </div>
              )}
              {wishlistAnimating && (
                <span className="absolute inset-0 rounded-xl border-2 border-pink-400 animate-ping opacity-75"></span>
              )}
            </button>
          </div>
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