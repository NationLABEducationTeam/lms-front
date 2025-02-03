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
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import DashboardLayout from '@/components/common/layout/DashboardLayout';

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
              안녕하세요, {user?.name || '학생'}님 👋
            </h1>
            <p className="text-blue-100">
              오늘도 함께 성장하는 하루 되세요!
            </p>
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
                <CardTitle className="text-sm font-medium">출석률</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAttendanceRate()}%</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${getAttendanceRate()}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.3 }}>
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

          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.4 }}>
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

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 수강 중인 강의 */}
          <motion.div 
            className="lg:col-span-2"
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
                  전체보기
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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

          {/* 오른쪽: 활동 피드 */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.6 }}
          >
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl">최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="notices" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notices" className="text-xs">
                      공지사항
                    </TabsTrigger>
                    <TabsTrigger value="qna" className="text-xs">
                      QnA
                    </TabsTrigger>
                    <TabsTrigger value="community" className="text-xs">
                      커뮤니티
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notices">
                    <div className="space-y-4">
                      {notices.slice(0, 5).map((notice, index) => (
                        <motion.div
                          key={notice.metadata.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                        >
                          <Bell className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notice.content.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notice.metadata.createdAt), { addSuffix: true, locale: ko })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="qna">
                    <div className="space-y-4">
                      {qnaPosts.slice(0, 5).map((post, index) => (
                        <motion.div
                          key={post.metadata.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/qna/${post.metadata.id}`)}
                        >
                          <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {post.content.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(post.metadata.createdAt), { addSuffix: true, locale: ko })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="community">
                    <div className="space-y-4">
                      {communityPosts.slice(0, 5).map((post, index) => (
                        <motion.div
                          key={post.metadata.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/community/${post.metadata.id}`)}
                        >
                          <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {post.content.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(post.metadata.createdAt), { addSuffix: true, locale: ko })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 마감 임박 알림 */}
            <Card className="bg-white mt-6">
              <CardHeader>
                <CardTitle className="text-xl">마감 임박</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingDeadlines().map((deadline, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100"
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