import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { getEnrolledCourses } from '@/services/api/courses';
import { attendanceApi, getOfflineCode } from '@/services/api/attendance';
import { useAttendanceTimer } from '@/hooks/useAttendanceTimer';
import { getQnaPosts } from '@/services/api/qna';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { useGetStudentGradesQuery, useGetAllAssignmentsQuery, Assignment, NewStudentGrades, getStudentGrades, useGetCourseAssignmentsQuery } from '@/services/api/studentApi';
import { Course } from '@/types/course';
import { QnaPost } from '@/types/qna';
import { Notice } from '@/types/notice';
import { CommunityPost } from '@/types/community';
import { Card, Row, Col, Button, Calendar, Statistic, List, Tag, Typography, Space, Badge, Progress, Avatar, Tabs, Select, Empty, Spin, Alert, Dropdown, Menu, Modal, Input } from 'antd';
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
import CourseStatsCard from '@/components/dashboard/CourseStatsCard';
import AssignmentSection from '@/components/dashboard/AssignmentSection';
import BoardTabs from '@/components/dashboard/BoardTabs';

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
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // 개별 데이터 상태
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  // 기타 데이터(탭 이동 시 fetch)
  const [qnaPosts, setQnaPosts] = useState<QnaPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [offlineCode, setOfflineCode] = useState('');
  const [offlineError, setOfflineError] = useState('');
  const [pendingCourseId, setPendingCourseId] = useState<string>('');
  
  // 오프라인 출석 시간 추적 훅
  const { 
    startTimer, 
    formattedTime,
    isTimerRunning,
    courseId: timerCourseId
  } = useAttendanceTimer();

  const [gradeData, setGradeData] = useState<NewStudentGrades | null>(null);

  // RTK Query 관련 주석 처리 또는 제거
  // const { data: gradeData, isLoading: isGradeLoading, error: gradeError } = useGetStudentGradesQuery(selectedCourseId, {
  //   skip: !selectedCourseId
  // });

  useEffect(() => {
    // API 응답 구조 로깅
    // console.log('성적 데이터 응답:', gradeData);
  }, []);

  // RTK Query 관련 주석 처리 또는 제거
  // const { data: assignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useGetAllAssignmentsQuery();

  useEffect(() => {
    console.log('대시보드 데이터 상태:', {
      과제목록: {
        로딩중: false,
        에러: null,
        데이터: [],
        개수: 0
      },
      성적정보: {
        과목ID: selectedCourseId,
        로딩중: gradeLoading,
        에러: gradeError ? JSON.stringify(gradeError) : null,
        데이터: []
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

  
  // useGetCourseAssignmentsQuery 이후에 upcomingAssignments 선언
  const { data: assignments = [], isLoading: assignmentsLoading, error: assignmentsError } = useGetCourseAssignmentsQuery(selectedCourseId, {
    skip: !selectedCourseId
  });

  // 과제 목록이 있으면 필터링, 없으면 빈 배열 반환
  const upcomingAssignments: Assignment[] = assignments && assignments.length > 0
    ? assignments
        .filter(assignment => 
          assignment.status === '진행중' || 
          (assignment.status === '마감됨' && new Date(assignment.due_date) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5)
    : [];
  

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

  const handleEnterCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course?.classmode === 'OFFLINE') {
      setPendingCourseId(courseId);
      setOfflineModalVisible(true);
    } else {
      navigate(`/mycourse/${courseId}`);
    }
  };

  const handleVerifyOffline = async () => {
    try {
      const response = await getOfflineCode();
      console.log('Retrieved code:', response);
      if (response && response.code === offlineCode) {
        message.success('출석 코드가 확인되었습니다.');
        
        // 타이머 시작 - 코드 확인 성공 시
        startTimer(pendingCourseId);
        
        // 코스 페이지로 이동
        navigate(`/mycourse/${pendingCourseId}`);
        
        // 모달 상태 초기화
        setOfflineModalVisible(false);
        setOfflineCode('');
        setOfflineError('');
      } else {
        setOfflineError('입력하신 코드가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Error verifying offline code:', error);
      setOfflineError('코드 확인 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (!selectedCourseId) return;

    // 성적 데이터 fetch
    setGradeLoading(true);
    setGradeError(null);
    getStudentGrades(selectedCourseId)
      .then(data => setGradeData(data))
      .catch(() => setGradeError('성적 데이터를 불러오지 못했습니다.'))
      .finally(() => setGradeLoading(false));
  }, [selectedCourseId]);

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
                  <Dropdown
                    overlay={
                      <Menu onClick={({ key }) => handleEnterCourse(key)}>
                        {courses.map(course => (
                          <Menu.Item key={course.id}>
                            {course.title}
                          </Menu.Item>
                        ))}
                      </Menu>
                    }
                    trigger={[ 'click' ]}
                  >
                    <Button 
                      type="primary" 
                      icon={<BookOutlined />} 
                      className="bg-dashboard-primary hover:bg-dashboard-secondary shadow-md hover:shadow-lg transition-all"
                    >
                      강의실 입장
                    </Button>
                  </Dropdown>
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
                <div className="text-2xl font-bold text-dashboard-primary">0%</div>
              </div>
              
              {/* 출석률 카드 */}
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrophyOutlined className="text-dashboard-success text-lg" />
                  </div>
                  <span className="text-dashboard-text-secondary font-medium">진도율</span>
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
            {/* 과제/퀴즈 섹션 - 분리된 컴포넌트 사용 */}
            <AssignmentSection selectedCourseId={selectedCourseId} />

            {/* 게시판 탭 섹션 - 분리된 컴포넌트 사용 */}
            <div onMouseEnter={() => {}}>
              <BoardTabs 
                notices={notices}
                qnaPosts={qnaPosts}
                communityPosts={communityPosts}
              />
            </div>
          </Col>

          {/* 오른쪽 사이드바 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              {/* 성적 정보 카드 - 분리된 컴포넌트 사용 */}
              <CourseStatsCard 
                courses={courses}
                selectedCourseId={selectedCourseId}
                onCourseChange={(courseId) => setSelectedCourseId(courseId)}
              />
            </Space>
          </Col>
        </Row>
      </div>
      <Modal
        title="오프라인 출석 인증"
        visible={offlineModalVisible}
        onOk={handleVerifyOffline}
        onCancel={() => { setOfflineModalVisible(false); setOfflineCode(''); setOfflineError(''); }}
        okText="확인"
        cancelText="취소"
      >
        <p>오늘의 인증 코드를 입력해주세요.</p>
        <Input
          value={offlineCode}
          onChange={(e) => setOfflineCode(e.target.value)}
          placeholder="인증 코드"
        />
        {offlineError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{offlineError}</p>}
      </Modal>
    </div>
  );
};

export default StudentDashboard; 