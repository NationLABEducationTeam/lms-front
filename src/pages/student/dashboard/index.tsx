import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getEnrolledCourses } from '@/services/api/courses';
import { attendanceApi } from '@/services/api/attendance';
import { getQnaPosts } from '@/services/api/qna';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { Course } from '@/types/course';
import { QnaPost } from '@/types/qna';
import { Notice } from '@/types/notice';
import { CommunityPost } from '@/types/community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { Alert, AlertDescription } from '@/components/common/ui/alert';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  BrainCircuit,
  Calendar,
  MessageSquare,
  Bell,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Flame,
  TrendingUp,
  Target,
  Book
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import DashboardLayout from '@/components/common/layout/DashboardLayout';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface AttendanceRecord {
  courseId: string;
  courseName: string;
  sessionDate: string;
  status: 'present' | 'late' | 'absent';
  duration?: number;
  joinTime?: string;
  leaveTime?: string;
}

interface UserAttendanceResponse {
  records: AttendanceRecord[];
}

const StudentDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [qnaPosts, setQnaPosts] = useState<QnaPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 구현시에는 API에서 데이터를 가져와야 합니다
  const mockData = {
    attendance: {
      streak: 7,
      thisMonth: 15,
      total: 45,
      lastAttendance: '2024-03-20T09:00:00',
    },
    learningStats: {
      totalLearningTime: 2460, // 분 단위
      completedLessons: 24,
      totalLessons: 56,
      averageDailyTime: 85, // 분 단위
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 모든 데이터 fetch
        const [
          coursesResponse,
          attendanceResponse,
          qnaResponse,
          noticesResponse,
          communityResponse
        ] = await Promise.all([
          getEnrolledCourses(),
          user?.sub ? attendanceApi.getAttendanceRecords(user.sub) : Promise.resolve({ records: [] } as UserAttendanceResponse),
          getQnaPosts(),
          getNotices(),
          getCommunityPosts()
        ]);

        setCourses(coursesResponse.courses);
        setAttendanceRecords(attendanceResponse.records);
        setQnaPosts(qnaResponse);
        setNotices(noticesResponse);
        setCommunityPosts(communityResponse);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getAttendanceRate = () => {
    if (!attendanceRecords.length) return 0;
    const present = attendanceRecords.filter(record => record.status === 'present').length;
    return Math.round((present / attendanceRecords.length) * 100);
  };

  const getUpcomingDeadlines = () => {
    // 실제로는 과제 데이터에서 마감일이 임박한 항목들을 필터링
    return courses.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 환영 메시지 */}
        <div className="mb-8">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
          >
            <h1 className="text-3xl font-bold mb-2">
              안녕하세요, {user?.given_name || '학생'}님 👋
            </h1>
            <p className="text-blue-100">
              오늘도 함께 성장하는 하루 되세요!
            </p>
            <div className="mt-4 flex items-center gap-2 text-white/90">
              <Flame className="h-5 w-5" />
              <span>{mockData.attendance.streak}일 연속 출석하셨어요!</span>
            </div>
          </motion.div>
        </div>

        {/* 출석 & 학습 현황 카드 */}

        {/* TODO BACKEND API : 출석 현황 카드 구현 */ }

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 출석 현황 카드 */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-transparent rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/2"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  출석 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 연속 출석 */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl text-white">
                    <div className="flex items-center gap-3">
                      <Flame className="h-8 w-8" />
                      <div>
                        <p className="text-sm text-white/90">연속 출석</p>
                        <p className="text-2xl font-bold">{mockData.attendance.streak}일</p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-white/90"
                      disabled={new Date(mockData.attendance.lastAttendance).toDateString() === new Date().toDateString()}
                    >
                      출석체크
                    </Button>
                  </div>

                  {/* 출석 통계 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">이번 달 출석</p>
                      <p className="text-2xl font-semibold text-gray-900">{mockData.attendance.thisMonth}일</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">전체 출석</p>
                      <p className="text-2xl font-semibold text-gray-900">{mockData.attendance.total}일</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 학습 통계 카드 */}
          {/* TODO BACKEND API2 : 학습 통계 카드 구현 */ }
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 via-indigo-400/10 to-transparent rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/2"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  학습 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 진도율 */}
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-xl text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-6 w-6" />
                      <p className="text-lg">학습 진도율</p>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-semibold inline-block text-white/90">
                            {Math.round((mockData.learningStats.completedLessons / mockData.learningStats.totalLessons) * 100)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-white/90">
                            {mockData.learningStats.completedLessons}/{mockData.learningStats.totalLessons} 완료
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 mb-4 overflow-hidden rounded bg-white/20">
                        <div
                          style={{ width: `${(mockData.learningStats.completedLessons / mockData.learningStats.totalLessons) * 100}%` }}
                          className="flex flex-col justify-center rounded bg-white shadow-lg"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* 학습 시간 통계 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <p className="text-sm text-gray-500">일일 평균</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900">
                        {Math.floor(mockData.learningStats.averageDailyTime / 60)}시간 {mockData.learningStats.averageDailyTime % 60}분
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-4 w-4 text-purple-500" />
                        <p className="text-sm text-gray-500">총 학습</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900">
                        {Math.floor(mockData.learningStats.totalLearningTime / 60)}시간
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">수강 중인 강의</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {courses.length > 0 ? '활발히 학습 중' : '새로운 강의를 시작해보세요'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }}>
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">최근 활동</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{qnaPosts.length + communityPosts.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  QnA {qnaPosts.length}개 / 커뮤니티 {communityPosts.length}개
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.3 }}>
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">새로운 공지</CardTitle>
                <Bell className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notices.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {notices.length > 0 ? '최근 업데이트 있음' : '새로운 공지 없음'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mb-8">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...fadeInUp.transition, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* 공지사항 카드 */}
            <div
              onClick={() => navigate('/notices')}
              className="group cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-orange-600 font-medium text-sm bg-orange-100 px-3 py-1 rounded-full">
                  {notices.length} 개의 새 공지
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                공지사항
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                중요한 공지사항과 업데이트를 확인하세요
              </p>
              <div className="flex items-center text-orange-600 font-medium">
                <span className="text-sm">바로가기</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Q&A 카드 */}
            <div
              onClick={() => navigate('/qna')}
              className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-blue-600 font-medium text-sm bg-blue-100 px-3 py-1 rounded-full">
                  {qnaPosts.length} 개의 질문
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                질의응답
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                학습 관련 질문과 답변을 확인하세요
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span className="text-sm">바로가기</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 커뮤니티 카드 */}
            <div
              onClick={() => navigate('/community')}
              className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-purple-600 font-medium text-sm bg-purple-100 px-3 py-1 rounded-full">
                  {communityPosts.length} 개의 게시글
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                커뮤니티
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                다른 학습자들과 소통하고 정보를 공유하세요
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span className="text-sm">바로가기</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 수강 중인 강의 */}
          <motion.div 
            className="lg:col-span-3"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.5 }}
          >
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">수강 중인 강의</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">현재 진행 중인 강의 목록입니다</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/courses')}
                >
                  강의실 바로가기
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <img 
                            src={course.thumbnail_url || '/default-course-thumbnail.jpg'} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">{course.instructor_name}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">수강 중인 강의가 없습니다</h3>
                    <p className="mt-2 text-sm text-gray-500">새로운 강의를 둘러보고 시작해보세요!</p>
                    <Button
                      className="mt-6"
                      onClick={() => navigate('/courses')}
                    >
                      강의 둘러보기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 마감 임박 알림 */}
          {/* TODO BACKEND API3 : 마감 임박 알림 카드 구현 */ }
          <motion.div
            className="lg:col-span-3"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.6 }}
          >
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl">마감 임박</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getUpcomingDeadlines().map((deadline, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {deadline.title} - 과제 마감
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          3일 남음
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 