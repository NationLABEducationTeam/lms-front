import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getEnrolledCourses } from '@/services/api/courses';
import { attendanceApi } from '@/services/api/attendance';
import { getQnaPosts } from '@/services/api/qna';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { useGetStudentGradesQuery, useGetAllAssignmentsQuery, Assignment } from '@/services/api/studentApi';
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
    <div style={{ background: '#f6f8fa', minHeight: '100vh' }}>
      {/* 상단 프로필 및 요약 정보 */}
      <div style={{ background: 'white', padding: '32px 24px', marginBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
        <Row gutter={[24, 24]} align="middle" justify="space-between">
          <Col>
            <Space size={24} align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ border: '2px solid #1677ff' }}>
                {user?.given_name?.[0]}
              </Avatar>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  안녕하세요, {user?.given_name}님!
                </Title>
                <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
                  오늘도 즐거운 학습 되세요.
                </Paragraph>
                <Space size={16} style={{ marginTop: 12 }}>
                  <Button type="primary" icon={<BookOutlined />} onClick={() => navigate('/mycourse')}>
                    강의실 입장
                  </Button>
                  <Button icon={<MessageOutlined />} onClick={() => navigate('/community')}>
                    커뮤니티
                  </Button>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size={32}>
              <Statistic 
                title="학습 진행률" 
                value={75} 
                suffix="%" 
                prefix={<RiseOutlined />}
              />
              <Statistic 
                title="출석률" 
                value={getAttendanceRate()} 
                suffix="%" 
                prefix={<TrophyOutlined />}
              />
              <Statistic 
                title="수강 과목" 
                value={courses.length} 
                prefix={<BookFilled />}
              />
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 24px' }}>
        <Row gutter={[24, 24]}>
          {/* 왼쪽 섹션: 게시판 */}
          <Col xs={24} lg={16}>
            {/* 과제/퀴즈 섹션 - 새로 추가 */}
            <Card 
              bordered={false}
              title={
                <Space>
                  <EditOutlined style={{ color: '#1677ff' }} />
                  <span>진행 중인 과제 및 퀴즈</span>
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/assignments')}>
                  전체보기 <RightOutlined />
                </Button>
              }
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginBottom: 24
              }}
            >
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
                  <div style={{ marginBottom: '10px' }}>
                    <Text type="secondary">총 {assignments.length}개의 과제/퀴즈가 있습니다</Text>
                  </div>
                  <List
                    dataSource={upcomingAssignments || []}
                    renderItem={(assignment) => (
                      <List.Item
                        key={assignment.item_id}
                        onClick={() => navigate(`/assignments/${assignment.item_id}`)}
                        style={listItemStyle}
                        className={listItemHoverClass}
                      >
                        <List.Item.Meta
                          avatar={getAssignmentIcon(assignment.item_type)}
                          title={
                            <Space>
                              <Text strong>{assignment.title}</Text>
                              {getStatusTag(assignment.status)}
                            </Space>
                          }
                          description={
                            <Space>
                              <Tag color="blue">{assignment.course_title}</Tag>
                              <Text type="secondary">
                                마감일: {formatDate(assignment.due_date)}
                              </Text>
                              <Text type={
                                assignment.status === '마감됨' ? 'danger' : 
                                getDaysLeft(assignment.due_date) === '오늘 마감' ? 'warning' : 'secondary'
                              }>
                                {getDaysLeft(assignment.due_date)}
                              </Text>
                            </Space>
                          }
                        />
                        <div>
                          {assignment.is_completed ? (
                            <Tag color="green">점수: {assignment.score}</Tag>
                          ) : (
                            <Button type="primary" size="small">
                              {assignment.status === '마감됨' ? '상세보기' : '제출하기'}
                            </Button>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Card>

            <Card 
              bordered={false}
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Tabs defaultActiveKey="notice" size="large">
                <TabPane 
                  tab={<Space><BellOutlined />공지사항</Space>} 
                  key="notice"
                >
                  <List
                    dataSource={notices.slice(0, 3)}
                    renderItem={(notice) => (
                      <List.Item
                        key={notice.metadata.id}
                        onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                        style={listItemStyle}
                        className={listItemHoverClass}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{notice.content.title}</Text>
                              {notice.metadata.isImportant && (
                                <Tag color="red">중요</Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Space>
                              <Tag color="blue">{notice.metadata.category}</Tag>
                              <Text type="secondary">
                                {new Date(notice.metadata.createdAt).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                        <Button type="link">자세히 보기</Button>
                      </List.Item>
                    )}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => navigate('/notices')}>
                      전체 공지사항 보기 <RightOutlined />
                    </Button>
                  </div>
                </TabPane>

                <TabPane 
                  tab={<Space><QuestionCircleOutlined />Q&A</Space>} 
                  key="qna"
                >
                  <List
                    dataSource={qnaPosts.slice(0, 3)}
                    renderItem={(post) => (
                      <List.Item
                        key={post.metadata.id}
                        onClick={() => navigate(`/qna/${post.metadata.id}`)}
                        style={listItemStyle}
                        className={listItemHoverClass}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{post.content.title}</Text>
                              <Tag color={post.metadata.status === 'resolved' ? 'success' : 'warning'}>
                                {post.metadata.status === 'resolved' ? '해결됨' : '미해결'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space>
                              <Tag color="purple">{post.metadata.tags?.[0] || '질문'}</Tag>
                              <Text type="secondary">
                                {new Date(post.metadata.createdAt).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                        <Button type="link">자세히 보기</Button>
                      </List.Item>
                    )}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => navigate('/qna')}>
                      전체 Q&A 보기 <RightOutlined />
                    </Button>
                  </div>
                </TabPane>

                <TabPane 
                  tab={<Space><TeamOutlined />커뮤니티</Space>} 
                  key="community"
                >
                  <List
                    dataSource={communityPosts.slice(0, 3)}
                    renderItem={(post) => (
                      <List.Item
                        key={post.metadata.id}
                        onClick={() => navigate(`/community/${post.metadata.id}`)}
                        style={listItemStyle}
                        className={listItemHoverClass}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{post.content.title}</Text>
                              <Badge 
                                count={post.metadata.commentCount} 
                                style={{ backgroundColor: '#1677ff' }} 
                              />
                            </Space>
                          }
                          description={
                            <Space>
                              <Tag color="cyan">{post.metadata.category}</Tag>
                              <Text type="secondary">
                                {new Date(post.metadata.createdAt).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                        <Button type="link">자세히 보기</Button>
                      </List.Item>
                    )}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => navigate('/community')}>
                      전체 커뮤니티 보기 <RightOutlined />
                    </Button>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* 오른쪽 사이드바 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              {/* 성적 정보 카드 - 새로 추가 */}
              <Card
                title={
                  <Space>
                    <FileProtectOutlined style={{ color: '#1677ff' }} />
                    <span>성적 정보</span>
                  </Space>
                }
                extra={
                  <Select
                    style={{ width: 200 }}
                    placeholder="강의 선택"
                    value={selectedCourseId || undefined}
                    onChange={(value) => setSelectedCourseId(value)}
                  >
                    {courses.map(course => (
                      <Select.Option key={course.id} value={course.id}>
                        {course.title}
                      </Select.Option>
                    ))}
                  </Select>
                }
                bordered={false}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {isGradeLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : !gradeData || !selectedCourseId ? (
                  <Empty 
                    description="강의를 선택하세요"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Card bordered={false} style={{ background: '#e6f4ff', borderRadius: 8 }}>
                            <Statistic
                              title="총점"
                              value={gradeData.totalScore ?? '미집계'}
                              valueStyle={{ color: '#1677ff' }}
                              suffix={gradeData.totalScore !== undefined ? '점' : ''}
                            />
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 8 }}>
                            <Statistic
                              title="출석률"
                              value={gradeData.attendanceRate ?? '미집계'}
                              valueStyle={{ color: '#52c41a' }}
                              suffix={gradeData.attendanceRate !== undefined ? '%' : ''}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </div>
                    <List
                      dataSource={gradeData.gradeItems?.slice(0, 3) || []}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              item.type === 'EXAM' ? 
                                <BulbOutlined style={{ color: '#722ed1', fontSize: 24 }} /> :
                              item.type === 'ASSIGNMENT' ? 
                                <FileTextOutlined style={{ color: '#1677ff', fontSize: 24 }} /> :
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                            }
                            title={item.title}
                            description={
                              <Space>
                                <Tag color={
                                  item.status === 'completed' ? 'success' :
                                  item.status === 'overdue' ? 'error' : 'warning'
                                }>
                                  {item.status === 'completed' ? '완료' : 
                                   item.status === 'overdue' ? '기한초과' : '진행중'}
                                </Tag>
                                {item.score !== undefined && (
                                  <Tag color="blue">{item.score}/{item.maxScore || 100}점</Tag>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    {gradeData.gradeItems?.length > 3 && (
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button type="link" onClick={() => navigate(`/student/courses/${selectedCourseId}/grades`)}>
                          성적 상세 보기 <RightOutlined />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* 다가오는 마감 일정 - 기존 카드를 과제 데이터로 대체 */}
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                    <span>다가오는 마감</span>
                  </Space>
                }
                bordered={false}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {isLoadingAssignments ? (
                  <div className="flex justify-center items-center py-4">
                    <Spin />
                  </div>
                ) : !upcomingAssignments || upcomingAssignments.length === 0 ? (
                  <Empty description="다가오는 마감이 없습니다" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={upcomingAssignments}
                    renderItem={(assignment) => (
                      <List.Item
                        key={assignment.item_id}
                        onClick={() => navigate(`/assignments/${assignment.item_id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <List.Item.Meta
                          avatar={getAssignmentIcon(assignment.item_type)}
                          title={assignment.title}
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{assignment.course_title}</Text>
                              <Text type={
                                assignment.status === '마감됨' ? 'danger' : 
                                getDaysLeft(assignment.due_date) === '오늘 마감' ? 'warning' : 'secondary'
                              }>
                                {formatDate(assignment.due_date)} ({getDaysLeft(assignment.due_date)})
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* 출석 캘린더 */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    <span>출석 현황</span>
                  </Space>
                }
                bordered={false}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Calendar fullscreen={false} />
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StudentDashboard; 