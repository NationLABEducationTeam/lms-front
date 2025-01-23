import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseList } from '@/components/courses/CourseList';
import { TodoCalendar } from '../calendar/TodoCalendar';
import AssignmentList from '../assignments/AssignmentList';
import { BoardTabs } from '@/components/board/BoardTabs';
import MyNote from '../note/Mynote';
import DashboardLayout from '@/components/common/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { BookOpen, FileText, BrainCircuit, Calendar, MessageSquare, Notebook } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert } from '@/components/common/ui/alert';
import { Button } from '@/components/common/ui/button';
import { getQnaPosts } from '@/services/api/qna';
import { QnaPost } from '@/types/qna';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const StudentDashboard: FC = () => {
  const navigate = useNavigate();
  const [courses] = useState<any[]>([]);
  const [error] = useState<string | null>(null);
  const [recentQnaPosts, setRecentQnaPosts] = useState<QnaPost[]>([]);

  useEffect(() => {
    const fetchQnaPosts = async () => {
      try {
        const posts = await getQnaPosts();
        // 최신순으로 정렬하고 상위 2개만 선택
        const sortedPosts = posts.sort((a, b) => 
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        ).slice(0, 2);
        setRecentQnaPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching QnA posts:', error);
      }
    };

    fetchQnaPosts();
  }, []);

  // TODO: 학생이 수강 신청한 과목 목록을 가져오는 로직 추가
  // 1. useEffect 내에서 백엔드 API 호출
  // 2. Express 서버에서 RDS의 student_courses 테이블 조회
  // 3. 조회된 course_id들을 기반으로 DynamoDB에서 해당 과목들의 정보를 가져옴
  // 4. 최종 결과를 courses state에 설정

  const handleJoinClass = (coursePath: string) => {
    navigate(`/${coursePath}`);
  };

  const handlePostClick = (boardType: 'notice' | 'community' | 'qna', postId: string) => {
    switch (boardType) {
      case 'notice':
        navigate(`/notices/${postId}`);
        break;
      case 'community':
        navigate(`/community/${postId}`);
        break;
      case 'qna':
        navigate(`/qna/${postId}`);
        break;
    }
  };

  const handleCreateClick = (boardType: 'community' | 'qna') => {
    switch (boardType) {
      case 'community':
        navigate('/community/create');
        break;
      case 'qna':
        navigate('/qna/create');
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <Alert variant="destructive">
              <p>{error}</p>
            </Alert>
          )}

          {/* 대시보드 제목 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              학습 대시보드
            </h1>
            <p className="mt-2 text-gray-600">
              학습 진행 상황과 일정을 한눈에 확인하고 관리하세요
            </p>
          </div>

          {/* 상단 카드 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    내 강의
                  </CardTitle>
                  <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{courses.length}</div>
                  <p className="text-sm text-blue-100 mt-1">
                    {courses.length > 0 ? `${courses.length}개의 강의 수강 중` : '수강 중인 강의가 없습니다'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    완료한 과제
                  </CardTitle>
                  <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">8/12</div>
                  <div className="mt-2">
                    <div className="w-full bg-emerald-400/30 rounded-full h-1.5">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: '66.66%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-100 mt-2">
                    이번 주 마감 2개
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    퀴즈 평균 점수
                  </CardTitle>
                  <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <BrainCircuit className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">92<span className="text-lg">점</span></div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">+5점</div>
                    <span className="text-sm text-purple-100">지난 주 대비</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-rose-500 to-rose-600 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    다가오는 일정
                  </CardTitle>
                  <div className="p-2 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">5</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">이번 주</div>
                    <span className="text-sm text-rose-100">3개 일정</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 바로가기 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  바로가기
                </h2>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      최근 강의
                    </CardTitle>
                    <div className="p-2 rounded-full bg-blue-100">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courses.length > 0 ? (
                      <div className="space-y-4">
                        {courses.slice(0, 2).map((course, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="p-2 rounded-full bg-blue-100">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-500">다음 수업: {course.nextClass}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-500 text-sm">수강 중인 강의가 없습니다</p>
                        <Button 
                          onClick={() => navigate('/courses')}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                        >
                          강의 둘러보기
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      Q&A
                    </CardTitle>
                    <div className="p-2 rounded-full bg-purple-100">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {recentQnaPosts.map((post) => (
                          <div 
                            key={post.metadata.id} 
                            className="p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => navigate(`/qna/${post.metadata.id}`)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${
                                post.metadata.isAnswered 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : 'bg-purple-100 text-purple-600'
                              } px-2 py-1 rounded-full`}>
                                {post.metadata.isAnswered ? '답변 완료' : '답변 대기'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(post.metadata.createdAt), { 
                                  addSuffix: true,
                                  locale: ko 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 line-clamp-1">
                              {post.content.title}
                            </p>
                          </div>
                        ))}
                        {recentQnaPosts.length === 0 && (
                          <div className="p-3 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-500">아직 Q&A 게시물이 없습니다</p>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => navigate('/qna')}
                        className="w-full bg-purple-50 hover:bg-purple-100 text-purple-600"
                      >
                        Q&A 게시판으로 이동
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      과제 관리
                    </CardTitle>
                    <div className="p-2 rounded-full bg-emerald-100">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">진행중인 과제</h4>
                            <span className="text-sm text-emerald-600">3개</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">다가오는 마감</p>
                            <p className="text-xs text-gray-500">데이터베이스 과제 3</p>
                          </div>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">D-2</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/assignments')}
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      >
                        과제 관리로 이동
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      일정 관리
                    </CardTitle>
                    <div className="p-2 rounded-full bg-rose-100">
                      <Calendar className="h-5 w-5 text-rose-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm">오늘</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">데이터베이스 중간고사</p>
                            <p className="text-xs text-gray-500">14:00 - 16:00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">내일</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">알고리즘 조별 미팅</p>
                            <p className="text-xs text-gray-500">10:00 - 12:00</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/calendar')}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600"
                      >
                        일정 관리로 이동
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      학습 노트
                    </CardTitle>
                    <div className="p-2 rounded-full bg-amber-100">
                      <Notebook className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">최근 작성</span>
                            <span className="text-xs text-gray-500">1시간 전</span>
                          </div>
                          <p className="text-sm text-gray-900 line-clamp-1">데이터베이스 정규화 정리노트</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">자주 찾는 노트</span>
                          </div>
                          <p className="text-sm text-gray-900 line-clamp-1">알고리즘 개념 정리</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/notes')}
                        className="w-full bg-amber-50 hover:bg-amber-100 text-amber-600"
                      >
                        학습 노트로 이동
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 