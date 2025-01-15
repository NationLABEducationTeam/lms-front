import { FC, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/common/ui/button';
import { motion } from 'framer-motion';
import { DynamoCourse, CATEGORY_MAPPING } from '@/types/course';
import { listPublicCourses } from '@/services/api/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { cn } from "@/lib/utils";
import { useKeenSlider } from 'keen-slider/react';
import type { KeenSliderInstance } from 'keen-slider';
import 'keen-slider/keen-slider.min.css';
import { useAuth } from '@/hooks/useAuth';

const CategoryIcon: FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case 'CLOUD':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/cloudcomp.svg" alt="Cloud Computing" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'AI_ML':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/aiml.svg" alt="AI/ML" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'WEB':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/webprogramming.svg" alt="Web Programming" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'AUTOMATION':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/automation.svg" alt="Automation" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'DEVOPS':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/devops.svg" alt="DevOps" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'DataEngineering':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/data-engineering.svg" alt="Data Engineering" className="h-5 w-5" />
          </div>
        </div>
      );
    case 'CodeingTest':
      return (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-lg blur-md opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <img src="/icons/codingtest.svg" alt="Coding Test" className="h-5 w-5" />
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
  });

  useEffect(() => {
    const autoplayInterval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 5000);

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [instanceRef]);

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
    <div className="relative">
      <div ref={sliderRef} className="keen-slider h-[400px]">
        {images.map((image, idx) => (
          <div key={idx} className="keen-slider__slide relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
              <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
              <p className="text-lg">{image.description}</p>
            </div>
          </div>
        ))}
      </div>
      {loaded && instanceRef.current && (
        <div className="absolute bottom-4 right-4 z-30 flex gap-2">
          {[...Array(images.length)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentSlide === idx ? "bg-white w-4" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StudentLanding: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<DynamoCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');

  // 메모이제이션된 필터링된 강의 목록
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (selectedMainCategory && selectedMainCategory !== 'all' && course.mainCategory !== selectedMainCategory) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center relative">
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                {user ? (
                  <span>
                    <span className="text-orange-400 font-mono">{"{"}</span>
                    <span className="text-purple-200">{user.name}</span>
                    <span className="text-orange-400 font-mono">{"}"}</span>
                    <span className="text-purple-100">님의 성장.py</span>
                  </span>
                ) : (
                  <span className="text-purple-100">Nations LAB과 함께하는 성장</span>
                )}
              </h1>
              <div className="mt-8 flex flex-col items-center justify-center space-y-4">
                <div className="flex flex-wrap justify-center gap-4 text-lg sm:text-xl font-medium text-purple-200/90">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AWS 클라우드
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI/머신러닝
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    데이터 엔지니어링
                  </span>
                </div>
                <p className="max-w-2xl mx-auto text-purple-100/80 text-lg">
                  단순한 이론 교육이 아닌, <span className="text-purple-300 font-semibold">실무 프로젝트 기반</span>의 
                  전문가 양성 프로그램으로 당신의 커리어를 한 단계 도약시키세요
                </p>
              </div>
              <div className="mt-10 flex justify-center gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    대시보드로 이동
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    onClick={() => navigate('/auth')}
                  >
                    무료로 시작하기
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Image Carousel Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ImageCarousel />
      </div>

      {/* Course Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
            Nation's LAB만의 특별한 여정
          </h2>
          <p className="text-lg text-gray-600">상상을 현실로 만드는 실무 중심 커리큘럼을 경험하세요</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Curriculum Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative p-8 rounded-2xl border border-purple-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">코드로 쓰는 성장 스토리</h3>
              <p className="text-gray-600">
                <span className="font-mono text-purple-600">{`if (열정 == true)`}</span><br />
                실무 전문가가 설계한 커리큘럼으로<br />
                당신의 성장 스토리를 함께 써내려갑니다
              </p>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative p-8 rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 코드 리뷰</h3>
              <p className="text-gray-600">
                <span className="font-mono text-blue-600">{`while (학습중) {`}</span><br />
                전문가의 코드 리뷰와 동료들의<br />
                피드백으로 함께 성장합니다
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative p-8 rounded-2xl border border-orange-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">성장 트래킹</h3>
              <p className="text-gray-600">
                <span className="font-mono text-orange-600">{`for (성장; 성공; 도약) {`}</span><br />
                데이터 기반 학습 분석으로<br />
                당신의 성장을 실시간 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Section */}
        <div className="flex justify-center gap-4 mb-12 overflow-x-auto pb-2">
          <Button
            variant="outline"
            className={cn(
              "relative flex flex-col items-center p-4 h-auto min-w-[120px] rounded-xl border-2 transition-all duration-300",
              "hover:scale-105 hover:shadow-md hover:border-transparent",
              "bg-gradient-to-b from-slate-900/80 to-purple-900/80 backdrop-blur-sm",
              selectedMainCategory === 'all' 
                ? "border-purple-400 shadow-purple-500/20 bg-gradient-to-br from-purple-900/90 to-slate-900/90" 
                : "border-purple-500/20 hover:bg-gradient-to-br hover:from-purple-900/80 hover:to-slate-900/80"
            )}
            onClick={() => setSelectedMainCategory('all')}
          >
            <div className="h-8 w-8 mb-2 rounded-lg bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-sm text-purple-100">전체</span>
            <span className="text-[10px] text-purple-300/80 mt-0.5">All Courses</span>
          </Button>

          {Object.entries(CATEGORY_MAPPING).map(([key, value]) => (
            <Button
              key={key}
              variant="outline"
              className={cn(
                "relative flex flex-col items-center p-4 h-auto min-w-[120px] rounded-xl border-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-md hover:border-transparent",
                "bg-gradient-to-b from-slate-900/80 to-purple-900/80 backdrop-blur-sm",
                selectedMainCategory === key 
                  ? "border-purple-400 shadow-purple-500/20 bg-gradient-to-br from-purple-900/90 to-slate-900/90" 
                  : "border-purple-500/20 hover:bg-gradient-to-br hover:from-purple-900/80 hover:to-slate-900/80"
              )}
              onClick={() => setSelectedMainCategory(key)}
            >
              <CategoryIcon category={key} />
              <span className="font-medium text-sm text-purple-100 mt-2">{value}</span>
              <span className="text-[10px] text-purple-300/80 mt-0.5">
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
          ))}
        </div>

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
                <Card 
                  className="group h-full hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {course.thumbnail ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <span className="px-2 py-1 bg-blue-600/90 text-white text-xs rounded-full backdrop-blur-sm shadow-sm">
                      {CATEGORY_MAPPING[course.mainCategory as keyof typeof CATEGORY_MAPPING]}
                    </span>
                    <span className="px-2 py-1 bg-blue-400/90 text-white text-xs rounded-full backdrop-blur-sm shadow-sm">
                      {course.subCategory}
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{course.description}</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{course.instructor}</p>
                            <p className="text-xs text-gray-500">강사</p>
                          </div>
                        </div>
                        {course.level && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            {course.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-semibold text-sm">
                          {course.price ? `${course.price.toLocaleString()}원` : '무료'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-purple-50/50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">체계적인 커리큘럼</h3>
              <p className="text-gray-600">
                <span className="font-mono text-purple-600">{`def learn_step_by_step():`}</span><br />
                전문가가 설계한 커리큘럼으로<br />
                단계별 학습을 경험하세요
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 피드백</h3>
              <p className="text-gray-600">
                <span className="font-mono text-blue-600">{`async function review() {`}</span><br />
                강사와 동료들의 피드백으로<br />
                더 빠른 성장을 이루세요
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 mb-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">학습 관리</h3>
              <p className="text-gray-600">
                <span className="font-mono text-orange-600">{`const progress = new`}</span><br />
                <span className="font-mono text-orange-600">{`Dashboard();`}</span><br />
                대시보드를 통해 나의 학습 현황을<br />
                한눈에 파악하세요
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentLanding; 