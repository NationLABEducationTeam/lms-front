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

      {/* 간소화된 Hero Section */}
      <div 
        className="relative overflow-hidden min-h-[60vh] flex items-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"
      >
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 z-0">
          {/* 흐릿한 그라데이션 원형 */}
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/20 via-dashboard-gradient-via/15 to-dashboard-gradient-to/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-dashboard-gradient-from/10 via-dashboard-gradient-via/15 to-dashboard-gradient-to/20 blur-3xl"></div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-8 text-center">
            {/* 컨텐츠 */}
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
            >
              {/* 헤드라인 */}
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                {user ? (
                    <span className="bg-gradient-to-r from-dashboard-gradient-from via-dashboard-gradient-via to-dashboard-gradient-to bg-clip-text text-transparent">
                      {user.name}님, 오늘 무엇을 배워볼까요?
                    </span>
                ) : (
                  <span className="bg-gradient-to-r from-dashboard-gradient-from via-dashboard-gradient-via to-dashboard-gradient-to bg-clip-text text-transparent">
                    Nation's LAB에서 잠재력을 발휘하세요
                  </span>
                )}
              </h1>
              
              {/* 부제목 */}
              <p className="text-lg text-dashboard-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
                최신 기술과 전문가의 지식으로 여러분의 성장을 지원합니다.
              </p>
              
              {/* 버튼 영역 */}
              <div className="flex flex-wrap gap-5 justify-center">
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
            </motion.div>
        </div>
      </div>

      {/* Course Cards Section - 리디자인 */}
      <section id="courses-section" className="relative py-24 lg:py-32 bg-white">
        <div className="relative z-10 max-w-[90rem] mx-auto px-6 sm:px-8 lg:px-16">
          {/* 섹션 헤더 */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dashboard-text-primary mb-4">원하는 강의를 찾아보세요</h2>
            <p className="text-xl text-dashboard-text-secondary max-w-2xl mx-auto">
              최신 기술 트렌드를 반영한 다양한 강의가 준비되어 있습니다.
            </p>
          </div>

          {/* 카테고리 필터 - 리디자인 */}
          <div className="relative mb-16 bg-white rounded-2xl p-4 lg:p-6 shadow-md border">
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
          {/* <div className="mt-16 text-center">
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
          </div> */}
        </div>
      </section>
    </div>
  );
};

export default StudentLanding; 