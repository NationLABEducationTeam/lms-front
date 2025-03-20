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
import { useKeenSlider } from 'keen-slider/react';
import type { KeenSliderInstance } from 'keen-slider';
import 'keen-slider/keen-slider.min.css';
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
  const [loaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider: KeenSliderInstance) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    loop: true,
    mode: "snap",
    rtl: false,
    slides: { perView: 1 },
    drag: true,
    renderMode: "performance",
    defaultAnimation: {
      duration: 1000,
    },
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying && instanceRef.current) {
      intervalId = setInterval(() => {
        instanceRef.current?.next();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [instanceRef, isPlaying]);

  const images = [
    {
      url: "/carousel/1.png",
      title: "클라우드 전문가와 함께하는 실무 중심 교육",
      description: "AWS 공인 전문가들과 함께 실제 프로젝트를 통해 배우는 클라우드 컴퓨팅"
    },
    {
      url: "/carousel/2.png",
      title: "AI & 머신러닝 마스터 과정",
      description: "최신 AI 기술을 활용한 실무 프로젝트 경험"
    },
    {
      url: "/carousel/3.png",
      title: "데이터 엔지니어링 완성 과정",
      description: "빅데이터 처리부터 파이프라인 구축까지 완벽 마스터"
    },
    {
      url: "/carousel/4.png",
      title: "DevOps & MLOps 전문가 과정",
      description: "현대적인 개발 운영 방법론과 AI 운영 파이프라인 구축"
    },
    {
      url: "/carousel/5.png",
      title: "실시간 1:1 전문가 멘토링",
      description: "업계 최고 전문가들의 맞춤형 학습 가이드"
    }
  ];

  return (
    <div className="relative group">
      {/* Main Slider */}
      <div ref={sliderRef} className="keen-slider h-[400px] rounded-2xl overflow-hidden">
        {images.map((image, idx) => (
          <div 
            key={idx} 
            className="keen-slider__slide relative"
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${images.length}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: currentSlide === idx ? 1 : 0, y: currentSlide === idx ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold text-white mb-3">{image.title}</h3>
                <p className="text-xl text-white/90">{image.description}</p>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {loaded && instanceRef.current && (
        <>
          {/* Arrow Navigation */}
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Progress Bar and Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 rounded-full"
                  style={{ width: `${((currentSlide + 1) / images.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Dot Navigation and Controls */}
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>

              {/* Dot Navigation */}
              <div className="flex gap-2">
                {[...Array(images.length)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentSlide === idx 
                        ? "bg-white w-6" 
                        : "bg-white/50 hover:bg-white/70"
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course }: { course: Course }) => {
  const navigate = useNavigate();
  const cardColors = {
    WEB: {
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'bg-blue-100',
    },
    AI_ML: {
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      hover: 'bg-purple-100',
    },
    CLOUD: {
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      hover: 'bg-emerald-100',
    },
    DEVOPS: {
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      hover: 'bg-amber-100',
    },
    AUTOMATION: {
      bgLight: 'bg-red-50',
      border: 'border-red-200',
      hover: 'bg-red-100',
    },
    DataEngineering: {
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200',
      hover: 'bg-indigo-100',
    },
    CodeingTest: {
      bgLight: 'bg-lime-50',
      border: 'border-lime-200',
      hover: 'bg-lime-100',
    },
  };

  const getCategoryColor = (category: string) => {
    return cardColors[category as keyof typeof cardColors] || {
      bgLight: 'bg-gray-50',
      border: 'border-gray-200',
      hover: 'bg-gray-100',
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
      className="group relative h-full"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* 카드 배경 */}
      <div className="absolute inset-0 transition-all duration-300 rounded-2xl bg-white border border-slate-200 group-hover:border-slate-300 group-hover:shadow-lg">
        <div className="absolute inset-0 rounded-2xl group-hover:opacity-100 opacity-0 transition-opacity shadow-xl"></div>
      </div>
      
      {/* 카드 콘텐츠 */}
      <div className="relative p-6 flex flex-col h-full">
        {/* 카테고리와 레벨 */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1.5",
            color.bgLight
          )}>
            <CategoryIcon category={course.main_category_id as MainCategoryId} className="shrink-0 w-4 h-4" />
            <span>{CATEGORY_MAPPING[course.main_category_id as MainCategoryId]}</span>
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
        
        {/* 주요 키워드 */}
        {course.description && (
          <div className="flex flex-wrap gap-1.5 mt-1 mb-3">
            {course.description.split(' ').slice(0, 3).map((word: string, index: number) => (
              <span 
                key={index}
                className="rounded-full px-2 py-0.5 text-xs bg-dashboard-card-accent text-dashboard-text-secondary"
              >
                {word}
              </span>
            ))}
            {course.description.split(' ').length > 3 && (
              <span className="rounded-full px-2 py-0.5 text-xs bg-dashboard-card-accent text-dashboard-text-secondary">
                +{course.description.split(' ').length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* 강사 정보 */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
              <img 
                src={course.thumbnail_url || '/default-avatar.jpg'} 
                alt={course.title || "강사"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                }}
              />
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
          
          <span className="text-sm font-medium text-dashboard-primary">자세히 보기</span>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 마우스 위치 추적 함수
  const handleMouseMove = (e: React.MouseEvent) => {
    const hero = e.currentTarget as HTMLElement;
    const rect = hero.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // 강의 목록으로 스크롤하는 함수 추가
  const scrollToCourses = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      const navHeight = 96; // 네비게이션 바 높이 (88px + 8px)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Server message display */}
      {serverMessage && (
        <div className="bg-dashboard-gradient-from/5 border-b border-dashboard-gradient-from/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-dashboard-primary font-medium">{serverMessage}</p>
          </div>
        </div>
      )}

      {/* 리디자인된 Hero Section */}
      <div 
        className="relative overflow-hidden min-h-[90vh] flex items-center"
        onMouseMove={handleMouseMove}
      >
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 z-0">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>
          
          {/* 격자 패턴 */}
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]"></div>
          
          {/* 흐릿한 그라데이션 원형 */}
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/10 via-dashboard-gradient-via/10 to-dashboard-gradient-to/5 blur-3xl opacity-70"></div>
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/5 via-dashboard-gradient-via/10 to-dashboard-gradient-to/10 blur-3xl opacity-50"></div>
        </div>

        {/* 움직이는 마우스 포인터 효과 */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(63, 92, 247, 0.03), rgba(108, 78, 248, 0.03) 30%, transparent 60%)`,
            mixBlendMode: "multiply"
          }}
        />

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
                  className="relative overflow-hidden group px-8 py-4 rounded-xl bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via text-white font-medium text-lg shadow-lg shadow-dashboard-gradient-from/20 transition-all duration-300"
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
                    className="relative overflow-hidden group px-8 py-4 rounded-xl bg-white text-dashboard-text-primary font-medium text-lg border border-gray-200 shadow-md transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      시작하기
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-dashboard-card-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via rounded-2xl blur opacity-10 group-hover:opacity-25 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-dashboard-gradient-from/10 shadow-xl shadow-dashboard-gradient-from/5 hover:shadow-dashboard-gradient-from/10 transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-dashboard-gradient-from/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-dashboard-primary" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold text-dashboard-primary mb-2 group-hover:scale-105 origin-left transition-transform duration-300">20+</h3>
                  <p className="text-lg text-dashboard-text-secondary">전문 강사진</p>
                </div>
              </div>

              {/* 통계 카드 - 강의 콘텐츠 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-secondary to-dashboard-accent rounded-2xl blur opacity-10 group-hover:opacity-25 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-dashboard-secondary/10 shadow-xl shadow-dashboard-secondary/5 hover:shadow-dashboard-secondary/10 transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-dashboard-secondary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-dashboard-secondary" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold text-dashboard-secondary mb-2 group-hover:scale-105 origin-left transition-transform duration-300">50+</h3>
                  <p className="text-lg text-dashboard-text-secondary">강의 콘텐츠</p>
                </div>
              </div>

              {/* 통계 카드 - 수강생 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-success to-green-400 rounded-2xl blur opacity-10 group-hover:opacity-25 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-dashboard-success/10 shadow-xl shadow-dashboard-success/5 hover:shadow-dashboard-success/10 transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-dashboard-success/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-dashboard-success" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold text-dashboard-success mb-2 group-hover:scale-105 origin-left transition-transform duration-300">1000+</h3>
                  <p className="text-lg text-dashboard-text-secondary">수강생</p>
                </div>
              </div>

              {/* 통계 카드 - 만족도 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-warning to-amber-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition-opacity duration-300"></div>
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-dashboard-warning/10 shadow-xl shadow-dashboard-warning/5 hover:shadow-dashboard-warning/10 transition-all duration-300">
                  <div className="mb-5 w-12 h-12 rounded-xl bg-dashboard-warning/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-dashboard-warning" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-bold text-dashboard-warning mb-2 group-hover:scale-105 origin-left transition-transform duration-300">98%</h3>
                  <p className="text-lg text-dashboard-text-secondary">만족도</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 하단 웨이브 디자인 */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg className="w-full h-full fill-slate-50" viewBox="0 0 1440 54" preserveAspectRatio="none">
            <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"></path>
          </svg>
        </div>
      </div>

      {/* Course Cards Section - 리디자인 */}
      <section id="courses-section" className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {/* 배경 패턴 및 장식 요소 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>
          {/* 장식용 그라데이션 원형 */}
          <div className="absolute top-1/4 left-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-to/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-from/5 blur-3xl"></div>
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
          <div className="relative mb-16 bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-slate-100 shadow-lg shadow-slate-200/20">
            <div className="flex items-center justify-between mb-4 px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-dashboard-gradient-to/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 3.75H4.5C3.25736 3.75 2.25 4.75736 2.25 6V18C2.25 19.2426 3.25736 20.25 4.5 20.25H19.5C20.7426 20.25 21.75 19.2426 21.75 18V6C21.75 4.75736 20.7426 3.75 19.5 3.75Z" stroke="#3F5CF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.25 20.25V3.75" stroke="#3F5CF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              {/* 그라데이션 오버레이 */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
              
              {/* 스크롤 가능한 컨테이너 */}
              <div className="overflow-x-auto hide-scrollbar pb-2">
                <div className="flex gap-3 px-4 py-2 min-w-max">
                  <button
                    onClick={() => setSelectedMainCategory('all')}
                    className={cn(
                      "rounded-full px-6 py-2.5 transition-all duration-300 min-w-[120px] font-medium text-sm border",
                      selectedMainCategory === 'all'
                        ? 'bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via border-0 text-white shadow-lg shadow-dashboard-gradient-from/20'
                        : 'border-gray-200 bg-white hover:bg-dashboard-card-accent text-dashboard-text-primary'
                    )}
                  >
                    전체 강의
                  </button>

                  {Object.entries(CATEGORY_MAPPING).map(([id, name]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedMainCategory(id)}
                      className={cn(
                        "rounded-full px-6 py-2.5 transition-all duration-300 min-w-[120px] font-medium text-sm border flex items-center justify-center gap-2",
                        selectedMainCategory === id
                          ? 'bg-gradient-to-r from-dashboard-gradient-from to-dashboard-gradient-via border-0 text-white shadow-lg shadow-dashboard-gradient-from/20'
                          : 'border-gray-200 bg-white hover:bg-dashboard-card-accent text-dashboard-text-primary'
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
              className="relative overflow-hidden group px-8 py-4 rounded-xl bg-white border border-gray-200 text-dashboard-text-primary font-medium text-lg shadow-md transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                더 많은 강의 보기
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-dashboard-card-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* 캐러셀 섹션 - 리디자인 */}
      <div className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        {/* 배경 패턴 및 장식 요소 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>
          {/* 장식용 그라데이션 원형 */}
          <div className="absolute top-1/4 left-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-to/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] rounded-full bg-dashboard-gradient-from/5 blur-3xl"></div>
        </div>
      
        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-dashboard-gradient-to/10 border border-dashboard-gradient-to/20">
              <span className="text-sm font-medium text-dashboard-primary">학습 경험</span>
            </div>
            <h2 className="text-4xl font-bold text-dashboard-text-primary mb-4">학습 성과</h2>
            <p className="text-xl text-dashboard-text-secondary max-w-2xl mx-auto">
              Nation's LAB과 함께한 수강생들의 이야기
            </p>
          </div>
          
          <div className="relative px-4">
            {/* 그라데이션 오버레이 */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <ImageCarousel />
          </div>
        </div>
      </div>

      {/* 학습 특징 섹션 - 리디자인 */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
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
              <div className="absolute inset-0 bg-white rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-slate-200 transition-all duration-300 group-hover:border-blue-200 group-hover:shadow-lg group-hover:shadow-blue-100/40 h-full">
                <div className="bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-via w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-dashboard-gradient-from/20">
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
              <div className="absolute inset-0 bg-white rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-slate-200 transition-all duration-300 group-hover:border-purple-200 group-hover:shadow-lg group-hover:shadow-purple-100/40 h-full">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
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
              <div className="absolute inset-0 bg-white rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-slate-200 transition-all duration-300 group-hover:border-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-100/40 h-full">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
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

          <div className="relative">
            <div className="relative overflow-hidden">
              <div className="flex gap-12">
                <div className="animate-scroll-left flex gap-12">
                  {['/tier_badge_dark.png', '/partner/nipa.png', '/partner/kt.png', '/partner/kitech.png', '/partner/Keti.png', '/partner/ict.png', '/partner/Incheon.png'].map((logo, index) => (
                  <div key={`dup1-${index}`} className="relative group">
                    <div className="w-[180px] h-[100px] bg-white rounded-lg p-6 flex items-center justify-center">
                      <img
                        src={logo}
                        alt={index === 0 ? "AWS Partner Select Tier Badge" : "Partner Logo"}
                        className={cn(
                          "w-auto h-auto object-contain",
                          index === 0 ? "max-w-[150px] max-h-[80px]" : "max-w-[120px] max-h-[60px]"
                        )}
                      />
                    </div>
                  </div>
                ))}
                </div>
                <div className="animate-scroll-left flex gap-12" aria-hidden="true">
                  {['/tier_badge_dark.png', '/partner/nipa.png', '/partner/kt.png', '/partner/kitech.png', '/partner/Keti.png', '/partner/ict.png', '/partner/Incheon.png'].map((logo, index) => (
                  <div key={`dup2-${index}`} className="relative group">
                    <div className="w-[180px] h-[100px] bg-white rounded-lg p-6 flex items-center justify-center">
                      <img
                        src={logo}
                        alt={index === 0 ? "AWS Partner Select Tier Badge" : "Partner Logo"}
                        className={cn(
                          "w-auto h-auto object-contain",
                          index === 0 ? "max-w-[150px] max-h-[80px]" : "max-w-[120px] max-h-[60px]"
                        )}
                      />
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div className="relative mt-12 overflow-hidden">
              <div className="flex gap-12">
                <div className="animate-scroll-right flex gap-12">
                  {['/partner/ewha.png', '/partner/cj.png', '/partner/hansol.png', '/partner/Smes.png', '/partner/kyungkitechno.png', '/partner/police-4.png', '/partner/sinwoo.png'].map((logo, index) => (
                    <div key={`dup1-${index}`} className="relative group">
                      <div className="w-[180px] h-[100px] bg-white rounded-lg p-6 flex items-center justify-center">
                        <img
                          src={logo}
                          alt="Partner Logo"
                          className="w-auto h-auto max-w-[120px] max-h-[60px] object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="animate-scroll-right flex gap-12" aria-hidden="true">
                  {['/partner/ewha.png', '/partner/cj.png', '/partner/hansol.png', '/partner/Smes.png', '/partner/경기테크노파크.png', '/partner/police-4.png', '/partner/sinwoo.png'].map((logo, index) => (
                    <div key={`dup2-${index}`} className="relative group">
                      <div className="w-[180px] h-[100px] bg-white rounded-lg p-6 flex items-center justify-center">
                        <img
                          src={logo}
                          alt="Partner Logo"
                          className="w-auto h-auto max-w-[120px] max-h-[60px] object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLanding; 