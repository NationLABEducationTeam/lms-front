import { FC, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/common/ui/button';
import { motion } from 'framer-motion';
import { Course, CATEGORY_MAPPING } from '@/types/course';
import { listPublicCourses } from '@/services/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { cn } from "@/lib/utils";
import { useKeenSlider } from 'keen-slider/react';
import type { KeenSliderInstance } from 'keen-slider';
import 'keen-slider/keen-slider.min.css';
import { useAuth } from '@/hooks/useAuth';
import { getApiConfig } from '@/config/api';
import { Target, User, Users, ChevronRight, BookOpen } from 'lucide-react';
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
  const categoryColors = {
    'CLOUD': 'from-sky-400/20 to-blue-500/20',
    'AI_ML': 'from-purple-400/20 to-indigo-500/20',
    'WEB': 'from-pink-400/20 to-rose-500/20',
    'AUTOMATION': 'from-emerald-400/20 to-green-500/20',
    'DEVOPS': 'from-amber-400/20 to-yellow-500/20',
    'DataEngineering': 'from-cyan-400/20 to-teal-500/20',
    'CodeingTest': 'from-violet-400/20 to-purple-500/20'
  };

  const categoryBadgeColors = {
    'CLOUD': 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-blue-500/25',
    'AI_ML': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-indigo-500/25',
    'WEB': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-rose-500/25',
    'AUTOMATION': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-green-500/25',
    'DEVOPS': 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-yellow-500/25',
    'DataEngineering': 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-teal-500/25',
    'CodeingTest': 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-purple-500/25'
  };

  const levelBadgeColors = {
    'BEGINNER': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25',
    'INTERMEDIATE': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-amber-500/25',
    'ADVANCED': 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-rose-500/25'
  };

  const levelText = {
    'BEGINNER': '초급',
    'INTERMEDIATE': '중급',
    'ADVANCED': '고급'
  };

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group relative h-[460px] w-full cursor-pointer perspective-1000"
    >
      {/* 3D 회전 효과를 위한 컨테이너 */}
      <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-3">
        {/* 카드 전면 */}
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-white shadow-lg backface-hidden">
          {/* 썸네일 컨테이너 */}
          <div className="relative h-[200px] w-full overflow-hidden rounded-t-2xl">
            {/* 카테고리별 그라데이션 오버레이 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[course.main_category_id]} opacity-80`}></div>
            
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <BookOpen className="h-16 w-16 text-slate-400" />
              </div>
            )}

            {/* 뱃지 컨테이너 */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${categoryBadgeColors[course.main_category_id]}`}>
                {CATEGORY_MAPPING[course.main_category_id]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${levelBadgeColors[course.level]}`}>
                {levelText[course.level]}
              </span>
            </div>
          </div>

          {/* 컨텐츠 섹션 */}
          <div className="p-6 flex flex-col h-[calc(100%-200px)]">
            {/* 제목 */}
            <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>

            {/* 설명 */}
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {course.description}
            </p>

            {/* 강사 정보 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm text-slate-700">{course.instructor_name}</span>
            </div>

            {/* 가격 섹션 */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {course.price.toLocaleString()}원
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 호버 시 나타나는 그라데이션 테두리 효과 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10"></div>
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
        // console.log('Current Environment:', import.meta.env.VITE_ENV || 'development');
        // console.log('Server URL:', baseUrl);
        // console.log('Server response:', data);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Server message display */}
      {serverMessage && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-blue-700">{serverMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100"
        onMouseMove={handleMouseMove}
      >
        {/* 마우스 포인터 효과 */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.25) 20%, transparent 40%)`,
            mixBlendMode: "multiply"
          }}
        />
        
        {/* Background Pattern & Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/5 to-slate-500/10"></div>
          {/* Decorative circles */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
              className="text-left"
            >
              <div className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-300">
                <span className="text-base font-semibold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">✨ 새로운 시작을 함께하세요</span>
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold text-slate-800 mb-10 tracking-tight leading-tight">
                {user ? (
                  <span className="flex flex-col gap-6">
                    <span className="text-slate-700">Welcome back,</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {user.name}
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col gap-6">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Nation's LAB
                    </span>
                    <span className="text-slate-700">과 함께하는 성장</span>
                  </span>
                )}
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                최신 기술 트렌드와 실무 중심의 교육으로 여러분의 성장을 돕습니다.
                지금 바로 시작하세요.
              </p>
              <div className="flex flex-wrap gap-6">
                <Button
                  onClick={scrollToCourses}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-xl relative overflow-hidden group"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.background = `radial-gradient(100px circle at ${x}px ${y}px, rgb(15, 23, 42), rgb(30, 41, 59))`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgb(15, 23, 42)';
                  }}
                >
                  강의 둘러보기
                </Button>
                {!user && (
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="bg-white/50 hover:bg-white/80 text-slate-900 border-slate-200 px-10 py-4 rounded-lg backdrop-blur-sm transition-all duration-200 text-xl relative overflow-hidden group"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      e.currentTarget.style.background = `radial-gradient(100px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    시작하기
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Right Content - Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-8"
            >
              {/* Stats Cards */}
              <div 
                className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.2), transparent 50%)`;
                    gradient.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.opacity = '0';
                  }
                }}
              >
                <div className="gradient-overlay absolute inset-0 opacity-0 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-sm group-hover:border-blue-300 transition-all duration-300">
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">20+</h3>
                  <p className="text-lg text-slate-600">전문 강사진</p>
                </div>
              </div>
              <div 
                className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(168, 85, 247, 0.2), transparent 50%)`;
                    gradient.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.opacity = '0';
                  }
                }}
              >
                <div className="gradient-overlay absolute inset-0 opacity-0 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200 shadow-sm group-hover:border-purple-300 transition-all duration-300">
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">50+</h3>
                  <p className="text-lg text-slate-600">강의 콘텐츠</p>
                </div>
              </div>
              <div 
                className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(16, 185, 129, 0.2), transparent 50%)`;
                    gradient.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.opacity = '0';
                  }
                }}
              >
                <div className="gradient-overlay absolute inset-0 opacity-0 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200 shadow-sm group-hover:border-emerald-300 transition-all duration-300">
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">1000+</h3>
                  <p className="text-lg text-slate-600">수강생</p>
                </div>
              </div>
              <div 
                className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.2), transparent 50%)`;
                    gradient.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  const gradient = card.querySelector('.gradient-overlay') as HTMLElement;
                  if (gradient) {
                    gradient.style.opacity = '0';
                  }
                }}
              >
                <div className="gradient-overlay absolute inset-0 opacity-0 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-sm group-hover:border-amber-300 transition-all duration-300">
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">98%</h3>
                  <p className="text-lg text-slate-600">만족도</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Course Cards Section */}
      <section id="courses-section" className="relative py-32 bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]"></div>

        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Featured Courses
              </span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">추천 강의</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              최신 트렌드를 반영한 다양한 강의를 만나보세요
            </p>
          </div>

          {/* Category Filter */}
          <div className="relative mb-16 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-lg font-semibold text-gray-900">카테고리</h3>
              <Button
                onClick={() => setSelectedMainCategory('all')}
                variant="ghost"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                필터 초기화
              </Button>
            </div>
            
            <div className="relative">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
              
              {/* Scrollable Container */}
              <div className="overflow-x-auto hide-scrollbar">
                <div className="flex gap-3 px-4 py-2 min-w-max">
                  <Button
                    onClick={() => setSelectedMainCategory('all')}
                    variant={selectedMainCategory === 'all' ? "default" : "outline"}
                    className={cn(
                      "rounded-full px-6 py-2 transition-all duration-300 min-w-[120px]",
                      selectedMainCategory === 'all'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-0'
                        : 'hover:border-blue-200 hover:bg-blue-50'
                    )}
                  >
                    전체 강의
                  </Button>
                  {Object.entries(CATEGORY_MAPPING).map(([id, name]) => (
                    <Button
                      key={id}
                      onClick={() => setSelectedMainCategory(id)}
                      variant={selectedMainCategory === id ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-6 py-2 transition-all duration-300 min-w-[120px] flex items-center justify-center gap-2",
                        selectedMainCategory === id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-0'
                          : 'hover:border-blue-200 hover:bg-blue-50'
                      )}
                    >
                      <CategoryIcon category={id} className="shrink-0" />
                      <span className="truncate">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <div className="bg-slate-50 py-32 overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">학습 성과</h2>
            <p className="text-xl text-gray-600">Nation's LAB과 함께한 수강생들의 이야기</p>
          </div>
          <ImageCarousel />
        </div>
      </div>

      {/* 학습 특징 섹션 */}
      <section className="relative py-32 bg-gradient-to-b from-slate-100 to-white overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]"></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
              <span className="text-sm font-medium text-slate-700">Learning Experience</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">체계적인 학습 경험</h2>
            <p className="text-lg text-slate-600">Nation's LAB만의 차별화된 교육 시스템을 경험하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 단계별 학습 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl backdrop-blur-xl transition-all duration-300 group-hover:from-blue-100 group-hover:to-indigo-100"></div>
              <div className="relative p-8 rounded-2xl border border-blue-200">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <code className="text-lg font-mono text-white">def</code>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">단계별 학습</h3>
                <div className="font-mono text-sm text-blue-600 mb-4 opacity-80">def learn_step_by_step():</div>
                <p className="text-slate-600 leading-relaxed">
                  전문가가 설계한 커리큘럼으로<br />
                  단계별 학습을 경험하세요
                </p>
              </div>
            </div>

            {/* 실시간 피드백 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl backdrop-blur-xl transition-all duration-300 group-hover:from-purple-100 group-hover:to-pink-100"></div>
              <div className="relative p-8 rounded-2xl border border-purple-200">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <code className="text-lg font-mono text-white">async</code>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">실시간 피드백</h3>
                <div className="font-mono text-sm text-purple-600 mb-4 opacity-80">async function review() {}</div>
                <p className="text-slate-600 leading-relaxed">
                  강사와 동료들의 피드백으로<br />
                  더 빠른 성장을 이루세요
                </p>
              </div>
            </div>

            {/* 학습 관리 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl backdrop-blur-xl transition-all duration-300 group-hover:from-emerald-100 group-hover:to-teal-100"></div>
              <div className="relative p-8 rounded-2xl border border-emerald-200">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <code className="text-lg font-mono text-white">const</code>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">학습 관리</h3>
                <div className="font-mono text-sm text-emerald-600 mb-4 opacity-80">const progress = new<br />Dashboard();</div>
                <p className="text-slate-600 leading-relaxed">
                  대시보드를 통해 나의 학습 현황을<br />
                  한눈에 파악하세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 장식용 그라데이션 원 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
      </section>

      {/* Partner Logos Section */}
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