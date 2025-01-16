import { FC, useState } from 'react';
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const StudentDashboard: FC = () => {
  const navigate = useNavigate();
  const [courses] = useState<any[]>([]);
  
  // TODO: 학생이 수강 신청한 과목 목록을 가져오는 로직 추가
  // 1. useEffect 내에서 백엔드 API 호출
  // 2. Express 서버에서 RDS의 student_courses 테이블 조회
  // 3. 조회된 course_id들을 기반으로 DynamoDB에서 해당 과목들의 정보를 가져옴
  // 4. 최종 결과를 courses state에 설정

  const [error] = useState<string | null>(null);

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
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="px-6 py-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
            학습 대시보드
          </h1>
          <p className="text-lg text-blue-100 opacity-90">
            학습 진행 상황과 일정을 한눈에 확인하고 관리하세요
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="-mt-12 px-6">
        <div className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <p>{error}</p>
            </Alert>
          )}

          {/* 상단 카드 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={fadeInUp.transition}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-none shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900/80">
                    내 강의
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-100/80 group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{courses.length}</div>
                  <p className="text-sm text-blue-600/80 mt-1">
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
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-none shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900/80">
                    완료한 과제
                  </CardTitle>
                  <div className="p-2 rounded-full bg-green-100/80 group-hover:bg-green-200 transition-colors">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">8/12</div>
                  <div className="mt-2">
                    <div className="w-full bg-green-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '66.66%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-green-600/80 mt-2">
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
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 border-none shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900/80">
                    퀴즈 평균 점수
                  </CardTitle>
                  <div className="p-2 rounded-full bg-purple-100/80 group-hover:bg-purple-200 transition-colors">
                    <BrainCircuit className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">92<span className="text-lg">점</span></div>
                  <div className="flex items-center gap-1 mt-2 text-purple-600">
                    <div className="text-xs bg-purple-100 px-2 py-0.5 rounded-full">+5점</div>
                    <span className="text-sm text-purple-600/80">지난 주 대비</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-rose-50/50 border-none shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-rose-900/80">
                    다가오는 일정
                  </CardTitle>
                  <div className="p-2 rounded-full bg-rose-100/80 group-hover:bg-rose-200 transition-colors">
                    <Calendar className="h-4 w-4 text-rose-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-rose-900">5</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="text-xs bg-rose-100 px-2 py-0.5 rounded-full text-rose-600">이번 주</div>
                    <span className="text-sm text-rose-600/80">3개 일정</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 바로가기 섹션 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-white to-purple-100/20 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
              <div className="border-b border-gray-200/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600">
                    바로가기
                  </h2>
                </div>
              </div>
              
              <div className="p-8">
                <Tabs defaultValue="courses" className="space-y-6">
                  <TabsList className="bg-gray-100/50 p-1 rounded-xl inline-flex backdrop-blur-sm">
                    <TabsTrigger 
                      value="courses"
                      className="px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow transition-all duration-200"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      내 강의
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assignments"
                      className="px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow transition-all duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      과제
                    </TabsTrigger>
                    <TabsTrigger 
                      value="calendar"
                      className="px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow transition-all duration-200"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      일정
                    </TabsTrigger>
                    <TabsTrigger 
                      value="board"
                      className="px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow transition-all duration-200"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      게시판
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chat"
                      className="px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow transition-all duration-200"
                    >
                      <Notebook className="h-4 w-4 mr-2" />
                      나만의 노트
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="courses" className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                    {courses.length > 0 ? (
                      <CourseList
                        courses={courses}
                        userRole="STUDENT"
                        onJoinClass={handleJoinClass}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="mb-4">
                          <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">수강 중인 강의가 없습니다</p>
                        <p className="text-sm text-gray-400 mt-1">새로운 강의를 찾아보세요</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="assignments" className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                    <AssignmentList />
                  </TabsContent>

                  <TabsContent value="calendar" className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                    <TodoCalendar />
                  </TabsContent>

                  <TabsContent value="board" className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                    <BoardTabs 
                      onPostClick={handlePostClick}
                      onCreateClick={handleCreateClick}
                    />
                  </TabsContent>

                  <TabsContent value="chat" className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                    <MyNote />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 