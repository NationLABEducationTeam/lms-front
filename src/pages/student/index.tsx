import { FC, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/common/ui/button';
import { motion } from 'framer-motion';
import { Course, MainCategoryId, CATEGORY_MAPPING } from '@/types/course';
import { listPublicCourses } from '@/services/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';
import { getApiConfig } from '@/config/api';
import { Target, User, Users, ChevronRight, BookOpen, ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/common/ui/badge';

const CategoryIcon: FC<{ category: string; className?: string }> = ({ category, className }) => {
  switch (category) {
    case 'CLOUD':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/cloudcomp.svg" alt="Cloud Computing" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'AI_ML':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/aiml.svg" alt="AI/ML" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'WEB':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/webprogramming.svg" alt="Web Programming" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'AUTOMATION':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/automation.svg" alt="Automation" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'DEVOPS':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/devops.svg" alt="DevOps" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'DataEngineering':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/data-engineering.svg" alt="Data Engineering" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    case 'CodeingTest':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/codingtest.svg" alt="Coding Test" className={cn("h-5 w-5", className)} />
          </div>
        </div>
      );
    default:
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 6V4M12 20V18M6 12H4M20 12H18" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      );
  }
};

const ImageCarousel: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // 첫 번째 이미지만 로드

  // 실제 public/carousel 폴더의 이미지 파일들 사용
  const images = [
    {
      url: "/carousel/1.png",
      title: "클라우드 전문가와 함께하는 실무 중심 교육",
      description: "AWS 공인 전문가들과 함께 실제 프로젝트를 통해 배우는 클라우드 컴퓨팅"
    },
    {
      url: "/carousel/2.png",
      title: "AI & 머신러닝 마스터 과정",
      description: "최신 AI 기술을 활용한 실무 프로젝트 경험과 전문가 멘토링"
    },
    {
      url: "/carousel/3.png",
      title: "데이터 엔지니어링 완성 과정",
      description: "빅데이터 처리부터 파이프라인 구축까지 완벽 마스터"
    },
    {
      url: "/carousel/4.png",
      title: "DevOps & 자동화 전문가 과정",
      description: "현대적인 개발 운영 방법론과 CI/CD 파이프라인 구축"
    }
  ];

  // 자동 재생
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % images.length;
        // 다음 이미지 미리 로드
        setLoadedImages(prevLoaded => new Set([...prevLoaded, next, (next + 1) % images.length]));
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  // 슬라이드 변경 시 이미지 미리 로드
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setLoadedImages(prevLoaded => new Set([...prevLoaded, index, (index + 1) % images.length]));
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % images.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + images.length) % images.length;
    goToSlide(prev);
  };

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden group shadow-2xl">
      {/* 이미지 컨테이너 */}
      <div className="relative w-full h-full bg-slate-800">
        {images.map((image, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          >
            {/* Lazy Loading - 현재 및 다음 이미지만 로드 */}
            {loadedImages.has(index) && (
            <img
              src={image.url}
              alt={image.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}
            
            {/* 그라데이션 오버레이 - 하단만 어둡게 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* 콘텐츠 */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-8 lg:p-12 transition-all duration-500",
              index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: index === currentSlide ? 1 : 0, 
                  y: index === currentSlide ? 0 : 20 
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  {image.title}
                </h3>
                <p className="text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-md">
                  {image.description}
                </p>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
          <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="이전 슬라이드"
          >
        <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 p-3 lg:p-4 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="다음 슬라이드"
          >
        <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

      {/* 하단 컨트롤 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {/* 도트 네비게이션 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentSlide 
                  ? "w-8 h-2 bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via" 
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`슬라이드 ${index + 1}로 이동`}
                />
          ))}
            </div>

        {/* 재생/일시정지 버튼 */}
              <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all duration-300"
          aria-label={isAutoPlaying ? "자동 재생 정지" : "자동 재생 시작"}
              >
          {isAutoPlaying ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                )}
              </button>
      </div>

      {/* 진행 표시기 */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="h-1 bg-black/30">
          <div 
            className="h-full bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / images.length) * 100}%` }}
                  />
              </div>
            </div>
    </div>
  );
};

const CourseCard = ({ course }: { course: Course }) => {
  const navigate = useNavigate();
  const cardColors = {
    WEB: {
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'from-blue-400 to-blue-600',
      accentColor: 'blue',
    },
    AI_ML: {
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'from-purple-400 to-purple-600',
      accentColor: 'purple',
    },
    CLOUD: {
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'from-emerald-400 to-emerald-600',
      accentColor: 'emerald',
    },
    DEVOPS: {
      bgGradient: 'from-amber-50 to-amber-100',
      iconBg: 'from-amber-400 to-amber-600',
      accentColor: 'amber',
    },
    AUTOMATION: {
      bgGradient: 'from-red-50 to-red-100',
      iconBg: 'from-red-400 to-red-600',
      accentColor: 'red',
    },
    DataEngineering: {
      bgGradient: 'from-indigo-50 to-indigo-100',
      iconBg: 'from-indigo-400 to-indigo-600',
      accentColor: 'indigo',
    },
    CodeingTest: {
      bgGradient: 'from-lime-50 to-lime-100',
      iconBg: 'from-lime-400 to-lime-600',
      accentColor: 'lime',
    },
  };

  const getCategoryColor = (category: string) => {
    return cardColors[category as keyof typeof cardColors] || {
      bgGradient: 'from-gray-50 to-gray-100',
      iconBg: 'from-gray-400 to-gray-600',
      accentColor: 'gray',
    };
  };

  const getLevelBadge = (level: string) => {
    const levels: Record<string, { bg: string; text: string }> = {
      BEGINNER: {
        bg: 'bg-emerald-100 text-emerald-700',
        text: '입문',
      },
      ADVANCED: {
        bg: 'bg-amber-100 text-amber-700',
        text: '중급',
      },
      PROFESSIONAL: {
        bg: 'bg-red-100 text-red-700',
        text: '고급',
      },
    };
    return levels[level] || { bg: 'bg-gray-100 text-gray-700', text: '전체' };
  };

  const color = getCategoryColor(course.main_category_id as MainCategoryId);
  const levelBadge = getLevelBadge(course.level);
  
  return (
    <div 
      className="group relative h-full cursor-pointer"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* 카드 그림자 및 호버 효과 */}
      <div className="absolute inset-0 transition-all duration-300 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 ${color.bgGradient} -z-10 blur-xl transform group-hover:scale-105"></div>
      
      {/* 카드 콘텐츠 */}
      <div className="relative p-6 flex flex-col h-full bg-white rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* 상단 그라데이션 바 */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.iconBg}`}></div>
        
        {/* 카테고리와 레벨 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.iconBg} flex items-center justify-center shadow-sm`}>
              <CategoryIcon category={course.main_category_id as MainCategoryId} className="shrink-0 w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-dashboard-text-secondary">
              {Object.prototype.hasOwnProperty.call(CATEGORY_MAPPING, course.main_category_id)
                ? (CATEGORY_MAPPING as any)[course.main_category_id]
                : '기타'}
            </span>
          </div>
          
          <div className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            levelBadge.bg
          )}>
            {levelBadge.text}
          </div>
        </div>
        
        {/* 과정명 */}
        <h3 className="text-lg font-semibold text-dashboard-text-primary mb-2 line-clamp-2 group-hover:text-dashboard-primary transition-colors">
          {course.title}
        </h3>
        
        {/* 설명 */}
        <p className="text-sm text-dashboard-text-secondary mb-3 line-clamp-2">
          {course.description || "최신 트렌드를 반영한 전문 교육 과정입니다."}
        </p>
        
        {/* 강사 정보 */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${color.bgGradient} flex-shrink-0 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <User className="w-4 h-4 text-dashboard-text-secondary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-dashboard-text-primary line-clamp-1">
                {course.instructor_name || "전문 강사"}
              </span>
              <span className="text-xs text-dashboard-text-tertiary">
                강사
              </span>
            </div>
          </div>
          
          <span className={`text-sm font-medium text-${color.accentColor}-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1`}>
            자세히 보기
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

const StudentLanding: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [serverMessage, setServerMessage] = useState<string>('');

  // 강의 목록으로 스크롤하는 함수
  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      const navHeight = 96;
      const windowHeight = window.innerHeight;
      const elementRect = coursesSection.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (windowHeight / 2) + (elementRect.height / 2);
      
      window.scrollTo({
        top: middle - navHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchServerMessage = async () => {
      try {
        const { baseUrl } = getApiConfig();
        const response = await fetch(baseUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch server message');
        }
        const data = await response.json();
        setServerMessage(data.message);
      } catch (err) {
        console.error('Error fetching server message:', err);
      }
    };

    fetchServerMessage();
  }, []);

  // 메모이제이션된 필터링된 강의 목록
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (selectedMainCategory && selectedMainCategory !== 'all' && course.main_category_id !== selectedMainCategory) {
        return false;
      }
      return true;
    });
  }, [courses, selectedMainCategory]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await listPublicCourses();
        setCourses(data);
      } catch (err) {
        setError('강의 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Server message display */}
      {serverMessage && (
        <div className="bg-dashboard-gradient-from/5 border-b border-dashboard-gradient-from/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-dashboard-primary font-medium">{serverMessage}</p>
          </div>
        </div>
      )}

      {/* 리디자인된 Hero Section - 브랜드 색상 배경 */}
      <div 
        className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"
      >
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 z-0">
          {/* 격자 패턴 */}
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]"></div>
          
          {/* 흐릿한 그라데이션 원형 */}
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/20 via-dashboard-gradient-via/15 to-dashboard-gradient-to/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/10 via-dashboard-gradient-via/15 to-dashboard-gradient-to/20 blur-3xl"></div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="relative z-20 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 왼쪽 컨텐츠 */}
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
              className="text-left"
            >
              {/* 상단 배지 */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-dashboard-gradient-from/10 via-dashboard-gradient-via/10 to-dashboard-gradient-to/10 border border-dashboard-gradient-from/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-dashboard-accent" />
                <span className="text-sm font-medium text-dashboard-text-primary">새로운 시작을 함께하세요</span>
              </div>
              
              {/* 헤드라인 */}
              <h1 className="text-6xl sm:text-7xl font-bold mb-10 tracking-tight leading-[1.1]">
                {user ? (
                  <span className="flex flex-col gap-6">
                    <span className="text-dashboard-text-primary">환영합니다,</span>
                    <div className="relative">
                      <span className="bg-gradient-to-r from-dashboard-gradient-from via-dashboard-gradient-via to-dashboard-gradient-to bg-clip-text text-transparent">
                        {user.name}
                      </span>
                      <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via rounded-full"></div>
                    </div>
                  </span>
                ) : (
                  <span className="flex flex-col gap-6">
                    <div className="relative">
                      <span className="bg-gradient-to-r from-dashboard-gradient-from via-dashboard-gradient-via to-dashboard-gradient-to bg-clip-text text-transparent">
                        Nation's LAB
                      </span>
                      <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via rounded-full"></div>
                    </div>
                    <span className="text-dashboard-text-primary">과 함께하는 성장</span>
                  </span>
                )}
              </h1>
              
              {/* 부제목 */}
              <p className="text-xl text-dashboard-text-secondary mb-10 leading-relaxed max-w-2xl">
                최신 기술 트렌드와 실무 중심의 교육으로 여러분의 성장을 돕습니다.
                지금 바로 시작하세요.
              </p>
              
              {/* 버튼 영역 */}
              <div className="flex flex-wrap gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToCourses}
                  className="relative overflow-hidden group px-8 py-4 rounded-xl bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via text-white font-medium text-lg shadow-lg shadow-dashboard-gradient-from/30 transition-all duration-300 hover:shadow-xl hover:shadow-dashboard-gradient-from/40"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    강의 둘러보기
                    <ArrowDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-dashboard-gradient-via to-dashboard-gradient-to opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>

                {!user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/auth')}
                    className="relative overflow-hidden group px-8 py-4 rounded-xl bg-white/90 backdrop-blur-sm text-dashboard-text-primary font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      시작하기
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </motion.button>
                )}
              </div>

              {/* 스크롤 다운 인디케이터 */}
              <div className="hidden lg:block mt-20 animate-bounce">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-sm text-dashboard-text-secondary mb-2">스크롤하여 더 알아보기</span>
                  <ArrowDown className="w-5 h-5 text-dashboard-text-secondary" />
                </motion.div>
              </div>
            </motion.div>

            {/* 오른쪽 - 통계 카드 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 gap-6"
            >
              {/* 통계 카드 - 전문 강사진 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via bg-clip-text text-transparent mb-2 group-hover:scale-105 origin-left transition-transform duration-300">5+</h3>
                  <p className="text-lg text-dashboard-text-secondary">전문 강사진</p>
                </div>
              </div>

              {/* 통계 카드 - 강의 콘텐츠 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-secondary to-dashboard-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-dashboard-secondary to-dashboard-accent flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-dashboard-secondary to-dashboard-accent bg-clip-text text-transparent mb-2 group-hover:scale-105 origin-left transition-transform duration-300">3+</h3>
                  <p className="text-lg text-dashboard-text-secondary">강의 콘텐츠</p>
                </div>
              </div>

              {/* 통계 카드 - 수강생 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-success to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-dashboard-success to-green-400 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-dashboard-success to-green-400 bg-clip-text text-transparent mb-2 group-hover:scale-105 origin-left transition-transform duration-300">100+</h3>
                  <p className="text-lg text-dashboard-text-secondary">수강생</p>
                </div>
              </div>

              {/* 통계 카드 - 만족도 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-warning to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-dashboard-warning to-amber-500 flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-dashboard-warning to-amber-500 bg-clip-text text-transparent mb-2 group-hover:scale-105 origin-left transition-transform duration-300">98%</h3>
                  <p className="text-lg text-dashboard-text-secondary">만족도</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 하단 웨이브 디자인 */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg className="w-full h-full fill-gray-50" viewBox="0 0 1440 54" preserveAspectRatio="none">
            <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"></path>
          </svg>
        </div>
      </div>

      {/* Course Cards Section - 리디자인 */}
      <section id="courses-section" className="relative py-24 lg:py-32 bg-gray-50 overflow-hidden">
        {/* 배경 패턴 및 장식 요소 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>
          {/* 장식용 그라데이션 원형 */}
          <div className="absolute top-1/4 left-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-to/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-from/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-16">
          {/* 섹션 헤더 */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-dashboard-gradient-to/10 border border-dashboard-gradient-to/20">
              <span className="text-sm font-medium text-dashboard-primary">추천 강의</span>
            </div>
            <h2 className="text-4xl font-bold text-dashboard-text-primary mb-4">Nation's LAB의 베스트 강의</h2>
            <p className="text-xl text-dashboard-text-secondary max-w-2xl mx-auto">
              최신 트렌드를 반영한 다양한 강의로 여러분의 커리어를 발전시켜보세요
            </p>
          </div>

          {/* 카테고리 필터 - 리디자인 */}
          <div className="relative mb-16 bg-white rounded-2xl p-4 lg:p-6 shadow-md border-0">
            <div className="flex items-center justify-between mb-4 px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 3.75H4.5C3.25736 3.75 2.25 4.75736 2.25 6V18C2.25 19.2426 3.25736 20.25 4.5 20.25H19.5C20.7426 20.25 21.75 19.2426 21.75 18V6C21.75 4.75736 20.7426 3.75 19.5 3.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.25 20.25V3.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-dashboard-text-primary">카테고리</h3>
              </div>

              <button
                onClick={() => setSelectedMainCategory('all')}
                className="text-sm text-dashboard-text-secondary hover:text-dashboard-primary transition-colors"
              >
                필터 초기화
              </button>
            </div>
            
            <div className="relative">
              {/* 그라데이션 오버레이 제거 - 스크롤 컨테이너 개선 */}
              
              {/* 스크롤 가능한 컨테이너 */}
              <div className="overflow-x-auto hide-scrollbar pb-2">
                <div className="flex gap-3 px-4 py-2 min-w-max">
                  <button
                    onClick={() => setSelectedMainCategory('all')}
                    className={cn(
                      "rounded-full px-6 py-2.5 transition-all duration-300 min-w-[120px] font-medium text-sm",
                      selectedMainCategory === 'all'
                        ? 'bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via text-white shadow-lg shadow-dashboard-gradient-from/20'
                        : 'bg-gray-100 hover:bg-gray-200 text-dashboard-text-primary'
                    )}
                  >
                    전체 강의
                  </button>

                  {Object.entries(CATEGORY_MAPPING).map(([id, name]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedMainCategory(id)}
                      className={cn(
                        "rounded-full px-6 py-2.5 transition-all duration-300 min-w-[120px] font-medium text-sm flex items-center justify-center gap-2",
                        selectedMainCategory === id
                          ? 'bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via text-white shadow-lg shadow-dashboard-gradient-from/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-dashboard-text-primary'
                      )}
                    >
                      <CategoryIcon category={id} className="shrink-0" />
                      <span className="truncate">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid - 리디자인된 그리드 */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-dashboard-gradient-from border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-dashboard-text-primary mb-2">강의를 찾을 수 없습니다</h3>
              <p className="text-dashboard-text-secondary">다른 카테고리를 선택해 보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}

          {/* "더 많은 강의 보기" 버튼 */}
          <div className="mt-16 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/courses')}
              className="relative overflow-hidden group px-8 py-4 rounded-xl bg-white text-dashboard-text-primary font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                더 많은 강의 보기
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* 캐러셀 섹션 - 리디자인 */}
      <div className="relative py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-slate-900 overflow-hidden">
        {/* 배경 패턴 및 장식 요소 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>
          {/* 장식용 그라데이션 원형 */}
          <div className="absolute top-1/4 left-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-to/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-from/10 blur-3xl"></div>
        </div>
      
        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-dashboard-gradient-to/10 border border-dashboard-gradient-to/20 backdrop-blur-sm">
              <span className="text-sm font-medium text-dashboard-primary">학습 경험</span>
            </div>
            <h2 className="text-4xl font-bold text-dashboard-text-primary mb-4">학습 성과</h2>
            <p className="text-xl text-dashboard-text-secondary max-w-2xl mx-auto">
              Nation's LAB과 함께한 수강생들의 이야기
            </p>
          </div>
          
          <div className="relative">
            <ImageCarousel />
          </div>
        </div>
      </div>

      {/* 학습 특징 섹션 - 리디자인 */}
      <section className="relative py-24 lg:py-32 bg-gray-50 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>
          {/* 장식용 그라데이션 원형 */}
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-dashboard-gradient-from/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-dashboard-gradient-to/5 blur-3xl"></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-dashboard-gradient-from/10 border border-dashboard-gradient-from/20">
              <span className="text-sm font-medium text-dashboard-primary">Learning Experience</span>
            </div>
            <h2 className="text-4xl font-bold text-dashboard-text-primary mb-4">체계적인 학습 경험</h2>
            <p className="text-xl text-dashboard-text-secondary max-w-2xl mx-auto">
              Nation's LAB만의 차별화된 교육 시스템을 경험하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* 단계별 학습 */}
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <div className="bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <code className="text-lg font-mono text-white">def</code>
                </div>
                <h3 className="text-2xl font-bold text-dashboard-text-primary mb-4">단계별 학습</h3>
                <div className="font-mono text-sm text-dashboard-primary mb-4 opacity-80">def learn_step_by_step():</div>
                <p className="text-dashboard-text-secondary leading-relaxed">
                  전문가가 설계한 커리큘럼으로<br />
                  단계별 학습을 경험하세요
                </p>
              </div>
            </motion.div>

            {/* 실시간 피드백 */}
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <code className="text-lg font-mono text-white">async</code>
                </div>
                <h3 className="text-2xl font-bold text-dashboard-text-primary mb-4">실시간 피드백</h3>
                <div className="font-mono text-sm text-purple-500 mb-4 opacity-80">async function review() {}</div>
                <p className="text-dashboard-text-secondary leading-relaxed">
                  강사와 동료들의 피드백으로<br />
                  더 빠른 성장을 이루세요
                </p>
              </div>
            </motion.div>

            {/* 학습 관리 */}
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <code className="text-lg font-mono text-white">const</code>
                </div>
                <h3 className="text-2xl font-bold text-dashboard-text-primary mb-4">학습 관리</h3>
                <div className="font-mono text-sm text-emerald-500 mb-4 opacity-80">const progress = new<br />Dashboard();</div>
                <p className="text-dashboard-text-secondary leading-relaxed">
                  대시보드를 통해 나의 학습 현황을<br />
                  한눈에 파악하세요
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 파트너사 로고 섹션 - 리디자인 */}
      <div className="relative py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">함께하는 파트너사</h2>
            <p className="text-lg text-blue-100">국내 최고의 기업들과 함께 성장하고 있습니다</p>
          </div>

          {/* 파트너 로고 그리드 - 애니메이션 대신 정적 그리드로 개선 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* 주요 파트너 - AWS 배지 특별 처리 */}
            <div className="group">
              <div className="bg-white rounded-xl p-6 h-28 flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-105">
                      <img
                  src="/tier_badge_dark.png"
                  alt="AWS Partner Select Tier"
                  className="max-h-16 w-auto object-contain"
                      />
                    </div>
                  </div>
            
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/nipa.png"
                  alt="NIPA"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                      <img
                  src="/partner/kt.png"
                  alt="KT"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/kitech.png"
                  alt="KITECH"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/Keti.png"
                  alt="KETI"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                        <img
                  src="/partner/ict.png"
                  alt="ICT"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>

            {/* 추가 파트너들 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/Incheon.png"
                  alt="인천광역시"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                        <img
                  src="/partner/ewha.png"
                  alt="이화여자대학교"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/cj.png"
                  alt="CJ"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                </div>
              </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/hansol.png"
                  alt="한솔"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
            </div>
          </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/Smes.png"
                  alt="중소기업진흥공단"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/kyungkitechno.png"
                  alt="경기테크노파크"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/police-4.png"
                  alt="경찰청"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/sinwoo.png"
                  alt="신우"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/Jeju_edu.png"
                  alt="제주교육청"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/Itp.png"
                  alt="ITP"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/klcox.png"
                  alt="KLCOX"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-28 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                <img
                  src="/partner/LS esectric.png"
                  alt="LS Electric"
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          {/* AWS 파트너 배지 강조 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <img
                  src="/partner/aws.png"
                  alt="AWS"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="text-white font-bold text-xl px-6">AWS Select Tier Partner</span>
              <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl p-4 shadow-xl">
                <img
                  src="/tier_badge_dark.png"
                  alt="AWS Partner Select Tier"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
            <p className="mt-4 text-blue-200 text-lg">
              Amazon Web Services의 공식 파트너사로서 최고 수준의 클라우드 교육을 제공합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLanding; 