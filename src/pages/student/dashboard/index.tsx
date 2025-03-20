import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getEnrolledCourses } from '@/services/api/courses';
import { attendanceApi } from '@/services/api/attendance';
import { getQnaPosts } from '@/services/api/qna';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { useGetStudentGradesQuery, useGetAllAssignmentsQuery, Assignment, NewStudentGrades } from '@/services/api/studentApi';
import { Course } from '@/types/course';
import { QnaPost } from '@/types/qna';
import { Notice } from '@/types/notice';
import { CommunityPost } from '@/types/community';
import { Card, Row, Col, Button, Calendar, Statistic, List, Tag, Typography, Space, Badge, Progress, Avatar, Tabs, Select, Empty, Spin, Alert } from 'antd';
import {
  BookOutlined,
  FileTextOutlined,
  BulbOutlined,
  CalendarOutlined,
  MessageOutlined,
  BellOutlined,
  TeamOutlined,
  RightOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  FireOutlined,
  LineChartOutlined,
  AimOutlined,
  BookFilled,
  BarChartOutlined,
  TrophyOutlined,
  RiseOutlined,
  UserOutlined,
  FileProtectOutlined,
  EditOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import DashboardLayout from '@/components/common/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // 성적 데이터 불러오기
  const { data: gradeData, isLoading: isGradeLoading, error: gradeError } = useGetStudentGradesQuery(selectedCourseId, {
    skip: !selectedCourseId
  });

  useEffect(() => {
    // API 응답 구조 로깅
    console.log('성적 데이터 응답:', gradeData);
  }, [gradeData]);

  // 과제 목록 불러오기
  const { data: assignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useGetAllAssignmentsQuery();

  useEffect(() => {
    console.log('대시보드 데이터 상태:', {
      과제목록: {
        로딩중: isLoadingAssignments,
        에러: assignmentsError ? JSON.stringify(assignmentsError) : null,
        데이터: assignments,
        개수: assignments?.length || 0
      },
      성적정보: {
        과목ID: selectedCourseId,
        로딩중: isGradeLoading,
        에러: gradeError ? JSON.stringify(gradeError) : null,
        데이터: gradeData
      }
    });
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
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
        // 첫 번째 코스 ID를 기본으로 선택
        if (coursesResponse.courses && coursesResponse.courses.length > 0) {
          setSelectedCourseId(coursesResponse.courses[0].id);
        }
        
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

  console.log('원본 과제 목록 데이터:', assignments);
  
  // 과제 목록이 있으면 필터링, 없으면 빈 배열 반환
  const upcomingAssignments = assignments && assignments.length > 0
    ? assignments
        .filter(assignment => 
          assignment.status === '진행중' || 
          (assignment.status === '마감됨' && new Date(assignment.due_date) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5)
    : [];
  
  console.log('필터링된 과제 목록:', upcomingAssignments);

  // 과제 타입에 따른 아이콘 반환
  const getAssignmentIcon = (type: string) => {
    switch(type) {
      case 'QUIZ':
        return <BulbOutlined style={{ color: '#722ed1', fontSize: 24 }} />;
      case 'EXAM':
        return <FileDoneOutlined style={{ color: '#eb2f96', fontSize: 24 }} />;
      case 'ASSIGNMENT':
      default:
        return <FileTextOutlined style={{ color: '#1677ff', fontSize: 24 }} />;
    }
  };

  // 과제 상태에 따른 태그 스타일 반환
  const getStatusTag = (status: string) => {
    switch(status) {
      case '제출완료':
        return <Tag color="success">완료</Tag>;
      case '마감됨':
        return <Tag color="error">마감</Tag>;
      case '진행중':
      default:
        return <Tag color="processing">진행중</Tag>;
    }
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 마감일까지 남은 날짜 계산
  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '마감됨';
    if (diffDays === 0) return '오늘 마감';
    return `${diffDays}일 남음`;
  };

  const getAttendanceRate = () => {
    if (!attendanceRecords.length) return 0;
    const present = attendanceRecords.filter(record => record.status === 'present').length;
    return Math.round((present / attendanceRecords.length) * 100);
  };

  // List.Item 호버 스타일을 위한 클래스 정의
  const listItemStyle = {
    cursor: 'pointer',
    padding: '16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white'
  };

  const listItemHoverClass = 'hover:bg-gray-50';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 상단 프로필 및 요약 정보 - Tailwind 리디자인 */}
      <div className="relative bg-white rounded-b-3xl shadow-md mb-8 overflow-hidden">
        {/* 배경 그라데이션 장식 */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-br from-dashboard-gradient-from via-dashboard-gradient-via to-dashboard-gradient-to opacity-10 rounded-bl-full"></div>
        
        <div className="px-6 py-8 sm:px-10 lg:px-16 relative">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* 프로필 및 인사말 */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-dashboard-gradient-from to-dashboard-gradient-to rounded-full blur opacity-30"></div>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined className="text-2xl" />} 
                  className="relative bg-white border-4 border-white shadow-lg"
                  style={{ backgroundColor: '#3F5CF7', color: 'white' }}
                >
                  {user?.given_name?.[0]}
                </Avatar>
              </div>
              
              <div className="pt-2">
                <h2 className="text-2xl font-bold text-dashboard-text-primary mb-1">
                  안녕하세요, {user?.given_name}님!
                </h2>
                <p className="text-dashboard-text-secondary mb-4">
                  오늘도 즐거운 학습 되세요.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button 
                    type="primary" 
                    icon={<BookOutlined />} 
                    onClick={() => navigate('/mycourse')}
                    className="bg-dashboard-primary hover:bg-dashboard-secondary shadow-md hover:shadow-lg transition-all"
                  >
                    강의실 입장
                  </Button>
                  <Button 
                    icon={<MessageOutlined />} 
                    onClick={() => navigate('/community')}
                    className="border-dashboard-primary text-dashboard-primary hover:bg-dashboard-card-accent hover:border-dashboard-secondary transition-all"
                  >
                    커뮤니티
                  </Button>
                </div>
              </div>
            </div>
            
            {/* 통계 카드 그룹 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 학습 진행률 카드 */}
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <RiseOutlined className="text-dashboard-primary text-lg" />
                  </div>
                  <span className="text-dashboard-text-secondary font-medium">학습 진행률</span>
                </div>
                <div className="text-2xl font-bold text-dashboard-primary">75%</div>
              </div>
              
              {/* 출석률 카드 */}
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrophyOutlined className="text-dashboard-success text-lg" />
                  </div>
                  <span className="text-dashboard-text-secondary font-medium">출석률</span>
                </div>
                <div className="text-2xl font-bold text-dashboard-success">{getAttendanceRate()}%</div>
              </div>
              
              {/* 수강 과목 카드 */}
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BookFilled className="text-dashboard-secondary text-lg" />
                  </div>
                  <span className="text-dashboard-text-secondary font-medium">수강 과목</span>
                </div>
                <div className="text-2xl font-bold text-dashboard-secondary">{courses.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <Row gutter={[24, 24]}>
          {/* 왼쪽 섹션: 게시판 */}
          <Col xs={24} lg={16}>
            {/* 과제/퀴즈 섹션 - Tailwind 리디자인 */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
              {/* 카드 헤더 */}
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <EditOutlined className="text-dashboard-primary text-lg" />
                  </div>
                  <h3 className="text-lg font-semibold text-dashboard-text-primary">진행 중인 과제 및 퀴즈</h3>
                </div>
                <button 
                  onClick={() => navigate('/assignments')}
                  className="text-dashboard-primary hover:text-dashboard-secondary flex items-center space-x-1 transition-colors"
                >
                  <span>전체보기</span>
                  <RightOutlined />
                </button>
              </div>

              {/* 카드 내용 */}
              <div className="p-5">
                {isLoadingAssignments ? (
                  <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                  </div>
                ) : assignmentsError ? (
                  <Alert
                    message="데이터 로딩 오류"
                    description={`과제 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (${JSON.stringify(assignmentsError)})`}
                    type="error"
                    showIcon
                  />
                ) : !assignments || assignments.length === 0 ? (
                  <Empty description="진행 중인 과제가 없습니다" />
                ) : (
                  <>
                    <div className="mb-4 text-dashboard-text-secondary">
                      총 {assignments.length}개의 과제/퀴즈가 있습니다
                    </div>
                    
                    <div className="space-y-4">
                      {upcomingAssignments.map((assignment) => (
                        <div
                          key={assignment.item_id}
                          onClick={() => navigate(`/assignments/${assignment.item_id}`)}
                          className="bg-white border border-gray-100 hover:border-dashboard-primary rounded-xl p-4 cursor-pointer transition-all hover:shadow-md group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full flex-shrink-0 
                                ${assignment.item_type === 'QUIZ' ? 'bg-purple-50' : 
                                  assignment.item_type === 'EXAM' ? 'bg-pink-50' : 'bg-blue-50'}`}
                              >
                                {getAssignmentIcon(assignment.item_type)}
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                                    {assignment.title}
                                  </h4>
                                  <div className={`text-xs px-2 py-0.5 rounded-full font-medium
                                    ${assignment.status === '제출완료' ? 'bg-green-100 text-green-600' : 
                                      assignment.status === '마감됨' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                                  >
                                    {assignment.status === '제출완료' ? '완료' : 
                                     assignment.status === '마감됨' ? '마감' : '진행중'}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 text-sm">
                                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                    {assignment.course_title}
                                  </span>
                                  <span className="text-dashboard-text-secondary">
                                    마감일: {formatDate(assignment.due_date)}
                                  </span>
                                  <span className={`
                                    ${assignment.status === '마감됨' ? 'text-red-500' : 
                                      getDaysLeft(assignment.due_date) === '오늘 마감' ? 'text-orange-500' : 'text-dashboard-text-secondary'}`}
                                  >
                                    {getDaysLeft(assignment.due_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              {assignment.is_completed ? (
                                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                                  점수: {assignment.score}
                                </div>
                              ) : (
                                <button className="bg-dashboard-primary hover:bg-dashboard-secondary text-white px-3 py-1 rounded-full text-sm transition-colors">
                                  {assignment.status === '마감됨' ? '상세보기' : '제출하기'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 게시판 탭 섹션 - Tailwind 리디자인 */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Ant Design의 Tabs 컴포넌트 사용 */}
              <Tabs 
                defaultActiveKey="notice" 
                size="large"
                className="dashboard-tabs" 
                tabBarStyle={{
                  margin: '0 16px',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                {/* 공지사항 탭 */}
                <TabPane 
                  tab={
                    <div className="flex items-center space-x-2 px-1">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <BellOutlined className="text-dashboard-accent" />
                      </div>
                      <span>공지사항</span>
                    </div>
                  } 
                  key="notice"
                >
                  <div className="p-4">
                    {notices.length === 0 ? (
                      <Empty description="공지사항이 없습니다" />
                    ) : (
                      <div className="space-y-3">
                        {notices.slice(0, 3).map((notice) => (
                          <div 
                            key={notice.metadata.id}
                            onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                            className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                                  {notice.content.title}
                                </h4>
                                {notice.metadata.isImportant && (
                                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                    중요
                                  </span>
                                )}
                              </div>
                              
                              <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                자세히 보기
                              </button>
                            </div>
                            
                            <div className="flex space-x-3 text-sm">
                              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                {notice.metadata.category}
                              </span>
                              <span className="text-dashboard-text-secondary">
                                {new Date(notice.metadata.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-center mt-6">
                      <button 
                        onClick={() => navigate('/notices')}
                        className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>전체 공지사항 보기</span>
                        <RightOutlined />
                      </button>
                    </div>
                  </div>
                </TabPane>

                {/* Q&A 탭 */}
                <TabPane 
                  tab={
                    <div className="flex items-center space-x-2 px-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                        <QuestionCircleOutlined className="text-dashboard-secondary" />
                      </div>
                      <span>Q&A</span>
                    </div>
                  } 
                  key="qna"
                >
                  <div className="p-4">
                    {qnaPosts.length === 0 ? (
                      <Empty description="Q&A 게시물이 없습니다" />
                    ) : (
                      <div className="space-y-3">
                        {qnaPosts.slice(0, 3).map((post) => (
                          <div 
                            key={post.metadata.id}
                            onClick={() => navigate(`/qna/${post.metadata.id}`)}
                            className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                                  {post.content.title}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full
                                  ${post.metadata.status === 'resolved' ? 
                                    'bg-green-100 text-green-600' : 
                                    'bg-amber-100 text-amber-600'
                                  }`}
                                >
                                  {post.metadata.status === 'resolved' ? '해결됨' : '미해결'}
                                </span>
                              </div>
                              
                              <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                자세히 보기
                              </button>
                            </div>
                            
                            <div className="flex space-x-3 text-sm">
                              <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                {post.metadata.tags?.[0] || '질문'}
                              </span>
                              <span className="text-dashboard-text-secondary">
                                {new Date(post.metadata.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-center mt-6">
                      <button 
                        onClick={() => navigate('/qna')}
                        className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>전체 Q&A 보기</span>
                        <RightOutlined />
                      </button>
                    </div>
                  </div>
                </TabPane>

                {/* 커뮤니티 탭 */}
                <TabPane 
                  tab={
                    <div className="flex items-center space-x-2 px-1">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                        <TeamOutlined className="text-dashboard-info" />
                      </div>
                      <span>커뮤니티</span>
                    </div>
                  } 
                  key="community"
                >
                  <div className="p-4">
                    {communityPosts.length === 0 ? (
                      <Empty description="커뮤니티 게시물이 없습니다" />
                    ) : (
                      <div className="space-y-3">
                        {communityPosts.slice(0, 3).map((post) => (
                          <div 
                            key={post.metadata.id}
                            onClick={() => navigate(`/community/${post.metadata.id}`)}
                            className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                                  {post.content.title}
                                </h4>
                                {post.metadata.commentCount > 0 && (
                                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                    댓글 {post.metadata.commentCount}
                                  </span>
                                )}
                              </div>
                              
                              <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                자세히 보기
                              </button>
                            </div>
                            
                            <div className="flex space-x-3 text-sm">
                              <span className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded">
                                {post.metadata.category}
                              </span>
                              <span className="text-dashboard-text-secondary">
                                {new Date(post.metadata.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-center mt-6">
                      <button 
                        onClick={() => navigate('/community')}
                        className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>전체 커뮤니티 보기</span>
                        <RightOutlined />
                      </button>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </Col>

          {/* 오른쪽 사이드바 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              {/* 성적 정보 카드 - Tailwind 리디자인 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* 카드 헤더 */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <FileProtectOutlined className="text-dashboard-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-semibold text-dashboard-text-primary">성적 정보</h3>
                  </div>

                  {/* 과목 선택 드롭다운 */}
                  <Select
                    style={{ width: 200 }}
                    placeholder="강의 선택"
                    value={selectedCourseId || undefined}
                    onChange={(value) => setSelectedCourseId(value)}
                    className="border-gray-200"
                  >
                    {courses.map(course => (
                      <Select.Option key={course.id} value={course.id}>
                        {course.title}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* 카드 내용 */}
                <div className="p-5">
                  {isGradeLoading ? (
                    <div className="flex justify-center items-center p-10">
                      <Spin size="large" />
                    </div>
                  ) : !gradeData || !selectedCourseId ? (
                    <div className="py-10">
                      <Empty 
                        description="강의를 선택하세요"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 과목 정보 헤더 */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-dashboard-primary">
                            {gradeData.course?.title || "강의 정보"}
                          </h4>
                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                            총 {gradeData.course?.weeks_count || 0}주차
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                            <div className="text-xs text-dashboard-text-secondary mb-1">출석 반영</div>
                            <div className="font-bold text-dashboard-primary">
                              {gradeData.course?.attendance_weight || 0}%
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                            <div className="text-xs text-dashboard-text-secondary mb-1">과제 반영</div>
                            <div className="font-bold text-dashboard-primary">
                              {gradeData.course?.assignment_weight || 0}%
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                            <div className="text-xs text-dashboard-text-secondary mb-1">시험 반영</div>
                            <div className="font-bold text-dashboard-primary">
                              {gradeData.course?.exam_weight || 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 성적 요약 */}
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-dashboard-text-secondary font-medium">총점</div>
                          <div className="text-2xl font-bold text-dashboard-gradient-from">
                            {gradeData.grades?.total_score || 0}점
                          </div>
                        </div>
                        <Progress 
                          percent={gradeData.grades?.total_score || 0} 
                          status="active"
                          strokeColor={{
                            '0%': '#3F5CF7',
                            '100%': '#6C4EF8'
                          }}
                          className="mt-1"
                        />
                      </div>

                      {/* 카테고리별 성적 상세 */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* 출석 */}
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircleOutlined className="text-dashboard-success" />
                            </div>
                            <h4 className="font-semibold text-dashboard-text-primary">출석</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">출석률</div>
                              <div className="text-xl font-semibold text-dashboard-success">
                                {gradeData.grades?.attendance?.rate || 0}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">출석 점수</div>
                              <div className="text-xl font-semibold text-dashboard-text-primary">
                                {gradeData.grades?.attendance?.score || 0}점
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-dashboard-text-secondary">
                            총 세션: {gradeData.grades?.attendance?.totalSessions || 0}회
                          </div>
                        </div>

                        {/* 과제 */}
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileTextOutlined className="text-dashboard-primary" />
                            </div>
                            <h4 className="font-semibold text-dashboard-text-primary">과제</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">과제 점수</div>
                              <div className="text-xl font-semibold text-dashboard-primary">
                                {gradeData?.grades?.assignment_score || 0}점
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">완료율</div>
                              <div className="text-xl font-semibold text-dashboard-text-primary">
                                {gradeData?.grades?.assignment_completion_rate || 0}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-dashboard-text-secondary">
                            진행 상황: {gradeData?.grades?.assignments ? 
                              gradeData.grades.assignments.filter(a => a.isCompleted === true).length : 0}/{gradeData?.course?.assignment_count || 0} 완료
                          </div>
                        </div>

                        {/* 시험 */}
                        <div className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <BulbOutlined className="text-dashboard-secondary" />
                            </div>
                            <h4 className="font-semibold text-dashboard-text-primary">시험</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">시험 점수</div>
                              <div className="text-xl font-semibold text-dashboard-secondary">
                                {gradeData?.grades?.exam_score || 0}점
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-dashboard-text-secondary mb-1">완료율</div>
                              <div className="text-xl font-semibold text-dashboard-text-primary">
                                {gradeData?.grades?.exam_completion_rate || 0}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-dashboard-text-secondary">
                            진행 상황: {gradeData?.grades?.exams ? 
                              gradeData.grades.exams.filter(e => e.isCompleted === true).length : 0}/{gradeData?.course?.exam_count || 0} 완료
                          </div>
                        </div>
                      </div>

                      {/* 전체 진행률 */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium text-dashboard-text-primary">전체 진행률</div>
                          <div className="font-medium text-dashboard-primary">{gradeData?.grades?.progress_rate || 0}%</div>
                        </div>
                        <Progress 
                          percent={gradeData?.grades?.progress_rate || 0} 
                          size="small"
                          strokeColor={{
                            '0%': '#3F5CF7',
                            '100%': '#6C4EF8'
                          }}
                        />
                      </div>

                      {/* 최근 성적 항목 */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-dashboard-text-primary">최근 성적 항목</h4>
                          <button 
                            onClick={() => navigate(`/student/courses/${selectedCourseId}/grades`)}
                            className="text-dashboard-primary hover:text-dashboard-secondary text-sm transition-colors"
                          >
                            모두 보기
                          </button>
                        </div>

                        {(!gradeData?.grades?.assignments?.length && !gradeData?.grades?.exams?.length) ? (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="성적 항목이 없습니다"
                            className="my-4"
                          />
                        ) : (
                          <div className="space-y-2">
                            {/* 과제 및 시험 목록 */}
                            {[
                              ...(gradeData?.grades?.assignments || []),
                              ...(gradeData?.grades?.exams || [])
                            ]
                              .filter(item => item) // 항목이 유효한 경우만 포함
                              .sort((a, b) => {
                                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                                return dateB - dateA;
                              })
                              .slice(0, 3)
                              .map((item, idx) => (
                                <div 
                                  key={idx}
                                  className="p-3 rounded-lg border border-gray-100 hover:border-dashboard-primary hover:shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                      ${item.type === 'ASSIGNMENT' ? 'bg-blue-50' : 'bg-purple-50'}`}
                                    >
                                      {item.type === 'ASSIGNMENT' ? (
                                        <FileTextOutlined className="text-dashboard-primary text-xs" />
                                      ) : (
                                        <BulbOutlined className="text-dashboard-secondary text-xs" />
                                      )}
                                    </div>
                                    <div className="text-sm font-medium text-dashboard-text-primary truncate">
                                      {item.title}
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <div className={`text-xs px-2 py-0.5 rounded-full
                                      ${item.isCompleted ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}
                                    >
                                      {item.isCompleted ? '완료' : '미완료'}
                                    </div>
                                    
                                    {item.score !== undefined && (
                                      <div className={`text-xs font-medium
                                        ${((item.score || 0) / (item.maxScore || 100) * 100) >= 70 ? 
                                          'text-green-600' : 'text-red-500'}`}
                                      >
                                        {item.score}/{item.maxScore || 100}점
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 다가오는 마감 일정 - Tailwind 리디자인 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* 카드 헤더 */}
                <div className="flex items-center p-5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                    <ClockCircleOutlined className="text-dashboard-warning text-lg" />
                  </div>
                  <h3 className="text-lg font-semibold text-dashboard-text-primary">다가오는 마감</h3>
                </div>

                {/* 카드 내용 */}
                <div className="p-5">
                  {isLoadingAssignments ? (
                    <div className="flex justify-center items-center py-6">
                      <Spin />
                    </div>
                  ) : !upcomingAssignments || upcomingAssignments.length === 0 ? (
                    <div className="py-6">
                      <Empty description="다가오는 마감이 없습니다" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAssignments.map((assignment) => (
                        <div
                          key={assignment.item_id}
                          onClick={() => navigate(`/assignments/${assignment.item_id}`)}
                          className="group p-3 border border-gray-100 hover:border-dashboard-warning rounded-xl flex items-center space-x-3 cursor-pointer transition-all hover:shadow-md"
                        >
                          {/* 과제 아이콘 */}
                          <div className={`p-3 rounded-full 
                            ${assignment.item_type === 'QUIZ' ? 'bg-purple-50' : 
                              assignment.item_type === 'EXAM' ? 'bg-pink-50' : 'bg-blue-50'}`}
                          >
                            {getAssignmentIcon(assignment.item_type)}
                          </div>
                          
                          {/* 과제 정보 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-dashboard-text-primary truncate group-hover:text-dashboard-primary transition-colors">
                              {assignment.title}
                            </h4>
                            <div className="text-sm text-dashboard-text-secondary truncate">
                              {assignment.course_title}
                            </div>
                            <div className={`text-sm mt-1
                              ${assignment.status === '마감됨' ? 'text-red-500' : 
                                getDaysLeft(assignment.due_date) === '오늘 마감' ? 'text-amber-500 font-medium' : 'text-dashboard-text-secondary'}`}
                            >
                              {formatDate(assignment.due_date)} ({getDaysLeft(assignment.due_date)})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 출석 캘린더 - Tailwind 리디자인 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* 카드 헤더 */}
                <div className="flex items-center p-5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                    <CalendarOutlined className="text-dashboard-success text-lg" />
                  </div>
                  <h3 className="text-lg font-semibold text-dashboard-text-primary">출석 현황</h3>
                </div>

                {/* 출석 캘린더 */}
                <div className="antd-calendar-wrapper">
                  <Calendar fullscreen={false} />
                </div>
                
                {/* 출석 상태 범례 */}
                <div className="px-5 pb-4 pt-1 flex flex-wrap gap-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-dashboard-text-secondary">출석</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                    <span className="text-xs text-dashboard-text-secondary">지각</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <span className="text-xs text-dashboard-text-secondary">결석</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                    <span className="text-xs text-dashboard-text-secondary">수업 없음</span>
                  </div>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StudentDashboard; 