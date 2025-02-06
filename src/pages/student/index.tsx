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
import AttendanceStreak from '@/components/dashboard/AttendanceStreak';
import { Target } from 'lucide-react';
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

  return (
    <Card 
      className="w-full h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50/80"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={course.thumbnail_url || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border-none">
            {course.main_category_name}
          </Badge>
          {course.sub_category_name && (
            <Badge className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border-none">
              {course.sub_category_name}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {course.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {course.instructor_name}
            </span>
            <Badge className={cn(
              "rounded-lg border-none",
              course.level === 'BEGINNER' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' :
              course.level === 'INTERMEDIATE' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' :
              'bg-rose-50 hover:bg-rose-100 text-rose-700'
            )}>
              {course.level === 'BEGINNER' ? '입문' : 
               course.level === 'INTERMEDIATE' ? '중급' : '고급'}
            </Badge>
          </div>
          <div className="text-right">
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {course.price.toLocaleString()}원
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Server message display */}
      {serverMessage && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-sm text-blue-700">{serverMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Stock Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/stockvideo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
              className="text-left"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                {user ? (
                  <span className="flex flex-col gap-3">
                    <span className="text-white/90">Welcome back,</span>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      {user.name}
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col gap-3">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      Nation's LAB
                    </span>
                    <span className="text-white/90">과 함께하는 성장</span>
                  </span>
                )}
              </h1>
              {user && <AttendanceStreak days={3} />}
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-4 text-lg sm:text-xl font-medium">
                  {['AWS 클라우드', '컴퓨터 비전/AI', '데이터 엔지니어링'].map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center px-4 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 mr-2 shadow-glow"></span>
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="max-w-2xl text-white text-lg mt-6">
                  단순한 이론 교육이 아닌, <span className="text-cyan-300 font-semibold">실무 프로젝트 기반</span>의 
                  전문가 양성 프로그램으로 당신의 커리어를 한 단계 도약시키세요
                </p>
              </div>
              <div className="mt-10 flex gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    대시보드로 이동
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
                    onClick={() => navigate('/auth')}
                  >
                    시작하기
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Instagram Landing SVG Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white space-y-6"
              >
                <h2 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    실무 중심의 교육
                  </span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  현업 전문가들과 함께 실제 프로젝트를 수행하며 실무 경험을 쌓아보세요.
                  이론에서 그치지 않는 실질적인 성장을 경험할 수 있습니다.
                </p>
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 rounded-3xl blur-3xl"></div>
                <img
                  src="/instagramlanding.svg"
                  alt="Instagram Landing Illustration"
                  className="relative z-10 w-full h-auto max-w-[500px] mx-auto"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Carousel Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ImageCarousel />
      </div>

      {/* Feature Cards Section */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Curriculum Card */}
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
                  <div className="relative">
                    <div className="h-12 w-12 mb-6 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">체계적인 커리큘럼</h3>
                    <div className="space-y-2">
                      <code className="block text-sm text-purple-300 font-mono">def learn_step_by_step():</code>
                      <p className="text-slate-300 leading-relaxed">
                        전문가가 설계한 커리큘럼으로<br />
                        단계별 학습을 경험하세요
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feedback Card */}
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.2 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                  <div className="relative">
                    <div className="h-12 w-12 mb-6 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">실시간 피드백</h3>
                    <div className="space-y-2">
                      <code className="block text-sm text-blue-300 font-mono">async function review() &#123;</code>
                      <p className="text-slate-300 leading-relaxed">
                        강사와 동료들의 피드백으로<br />
                        더 빠른 성장을 이루세요
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Card */}
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: 0.3 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                  <div className="relative">
                    <div className="h-12 w-12 mb-6 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">학습 관리</h3>
                    <div className="space-y-2">
                      <code className="block text-sm text-cyan-300 font-mono">const progress = new<br />Dashboard();</code>
                      <p className="text-slate-300 leading-relaxed">
                        대시보드를 통해 나의 학습 현황을<br />
                        한눈에 파악하세요
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="relative py-16 px-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-cyan-400/10"></div>
            
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-500/20 via-cyan-400/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2 group-hover:translate-y-0 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-600/20 via-cyan-400/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/2 group-hover:translate-y-0 transition-transform duration-700"></div>
            
            <div className="relative max-w-5xl mx-auto">
              <div className="flex items-center space-x-4 mb-8 pl-4">
                <div className="w-1.5 h-12 bg-gradient-to-b from-blue-400 to-cyan-300 rounded-full"></div>
                <h2 className="text-5xl font-bold text-white tracking-tight">
                  Shaping the Future with AI
                </h2>
              </div>
              
              <div className="space-y-8 pl-4">
                <div className="relative group/code w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-lg blur"></div>
                  <div className="relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <code className="font-mono text-lg text-white">{`class Future { start() {`}</code>
                  </div>
                </div>

                <div className="relative group/code w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-lg blur"></div>
                  <div className="relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <p className="text-xl text-white leading-relaxed">
                      AI 전문 기업의 풍부한 경험과 기술을 바탕으로 설계된 교육을 통해<br />
                      개인과 조직이 AI와 Cloud 기술을 통해 미래를 대비하고<br />
                      지속 가능한 성장을 이룰 수 있도록 돕습니다
                    </p>
                  </div>
                </div>

                <div className="relative group/code w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-lg blur"></div>
                  <div className="relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <code className="font-mono text-lg text-white">{`}}`}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Section */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 px-1 -mx-1">
          <Button
            variant="outline"
            className={cn(
              "relative flex flex-col items-center p-4 h-auto min-w-[130px] rounded-2xl transition-all duration-300",
              "hover:scale-102 hover:shadow-lg",
              "bg-gradient-to-b from-white to-gray-50",
              selectedMainCategory === 'all' 
                ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-500/20" 
                : "border border-gray-200 hover:border-blue-200"
            )}
            onClick={() => setSelectedMainCategory('all')}
          >
            <div className="h-10 w-10 mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-sm text-gray-900">전체 과정</span>
            <span className="text-[11px] text-gray-500 mt-1">All Courses</span>
          </Button>

          {/* Existing category buttons */}
          {Object.entries(CATEGORY_MAPPING).map(([key, value]) => {
            const categoryColors = {
              'CLOUD': { icon: 'text-sky-500', bg: 'from-sky-50 to-blue-50', ring: 'ring-sky-500 shadow-sky-500/20' },
              'AI_ML': { icon: 'text-blue-500', bg: 'from-blue-50 to-cyan-50', ring: 'ring-blue-500 shadow-blue-500/20' },
              'WEB': { icon: 'text-indigo-500', bg: 'from-indigo-50 to-blue-50', ring: 'ring-indigo-500 shadow-indigo-500/20' },
              'AUTOMATION': { icon: 'text-orange-500', bg: 'from-orange-50 to-amber-50', ring: 'ring-orange-500 shadow-orange-500/20' },
              'DEVOPS': { icon: 'text-emerald-500', bg: 'from-emerald-50 to-green-50', ring: 'ring-emerald-500 shadow-emerald-500/20' },
              'DataEngineering': { icon: 'text-cyan-500', bg: 'from-cyan-50 to-sky-50', ring: 'ring-cyan-500 shadow-cyan-500/20' },
              'CodeingTest': { icon: 'text-violet-500', bg: 'from-violet-50 to-purple-50', ring: 'ring-violet-500 shadow-violet-500/20' }
            };
            
            const colors = categoryColors[key as keyof typeof categoryColors];

            return (
              <Button
                key={key}
                variant="outline"
                className={cn(
                  "relative flex flex-col items-center p-4 h-auto min-w-[130px] rounded-2xl transition-all duration-300",
                  "hover:scale-102 hover:shadow-lg",
                  "bg-gradient-to-b from-white to-gray-50",
                  selectedMainCategory === key 
                    ? `ring-2 ${colors.ring} ring-offset-2 shadow-lg` 
                    : "border border-gray-200 hover:border-blue-200"
                )}
                onClick={() => setSelectedMainCategory(key)}
              >
                <div className={cn("h-10 w-10 mb-3 rounded-xl bg-gradient-to-br flex items-center justify-center", colors.bg)}>
                  <CategoryIcon category={key} className={colors.icon} />
                </div>
                <span className="font-medium text-sm text-gray-900">{value}</span>
                <span className="text-[11px] text-gray-500 mt-1">
                  {(() => {
                    switch(key) {
                      case 'CLOUD': return 'Cloud Computing';
                      case 'AI_ML': return 'AI & Machine Learning';
                      case 'WEB': return 'Web Development';
                      case 'AUTOMATION': return 'Automation';
                      case 'DEVOPS': return 'DevOps';
                      case 'DataEngineering': return 'Data Engineering';
                      case 'CodeingTest': return 'Coding Test';
                      default: return '';
                    }
                  })()}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Course List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLanding; 