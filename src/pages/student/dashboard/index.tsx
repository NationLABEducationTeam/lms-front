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
import { Card, Row, Col, Button, Calendar, Statistic, List, Tag, Typography, Space, Badge, Progress, Avatar, Tabs } from 'antd';
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
  UserOutlined
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

  useEffect(() => {
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

              {/* 다가오는 일정 */}
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                    <span>다가오는 일정</span>
                  </Space>
                }
                bordered={false}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <List
                  dataSource={[
                    { title: '클라우드 네트워킹 퀴즈', date: '2024-03-20', type: 'quiz' },
                    { title: '데이터베이스 과제 제출', date: '2024-03-22', type: 'assignment' },
                    { title: 'AWS 실습 세션', date: '2024-03-25', type: 'live' }
                  ]}
                  renderItem={(event) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          event.type === 'quiz' ? 
                            <BulbOutlined style={{ color: '#722ed1', fontSize: 24 }} /> :
                          event.type === 'assignment' ? 
                            <FileTextOutlined style={{ color: '#1677ff', fontSize: 24 }} /> :
                            <TeamOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                        }
                        title={event.title}
                        description={new Date(event.date).toLocaleDateString()}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StudentDashboard; 