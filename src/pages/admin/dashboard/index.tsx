import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchSubCategories, fetchCoursesByCategory, clearCourses } from '@/store/features/courses/coursesSlice';
import { getAllUsers } from '@/services/api/users';
import { getNotices } from '@/services/api/notices';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/useAuth';
import { CourseList } from '@/components/courses/CourseList';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { Button } from '@/components/common/ui/button';
import { LogOut, Bell, Search, Plus, FileText, Users, BookOpen, Settings } from 'lucide-react';
import { Input } from "@/components/common/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { DBUser } from '@/types/user';
import { Notice } from '@/types/notice';
import { Card, Col, Row, Statistic } from 'antd';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageOutlined, QuestionCircleOutlined, CommentOutlined, CloudServerOutlined } from '@ant-design/icons';

// 차트 데이터 타입 정의
interface CommunityChartData {
  date: string;
  posts: number;
}

interface QnaChartData {
  category: string;
  value: number;
}

interface CommentChartData {
  date: string;
  toxic: number;
  harassment: number;
  hate: number;
}

interface InfraChartData {
  time: string;
  cpu: number;
  memory: number;
}

const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categories, subCategories, courses, loading: coursesLoading, error: coursesError } = useSelector((state: RootState) => state.courses);
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 검색어에 따른 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTermLower) ||
      user.name?.toLowerCase().includes(searchTermLower) ||
      user.given_name?.toLowerCase().includes(searchTermLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    const loadCourses = async () => {
      if (user) {
        try {
          dispatch(clearCourses());
          
          const categoriesResult = await dispatch(fetchCategories()).unwrap();
          console.log('Loaded categories:', categoriesResult);
          
          for (const category of categoriesResult) {
            const subCatsResult = await dispatch(fetchSubCategories(category.path)).unwrap();
            console.log(`Loaded sub categories for ${category.name}:`, subCatsResult);
            
            for (const subCat of subCatsResult) {
              await dispatch(fetchCoursesByCategory({
                mainCategory: category.path,
                subCategory: subCat.name
              })).unwrap();
            }
          }
        } catch (error) {
          console.error('Error loading courses:', error);
        }
      }
    };

    loadCourses();
  }, [dispatch, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const studentCount = filteredUsers.filter(user => user.role === 'STUDENT').length;
  const instructorCount = filteredUsers.filter(user => user.role === 'INSTRUCTOR').length;
  const adminCount = filteredUsers.filter(user => user.role === 'ADMIN').length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-500';
      case 'INSTRUCTOR':
        return 'text-purple-500';
      case 'STUDENT':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleJoinClass = (coursePath: string) => {
    // TODO: 강의실 입장 로직 구현
    console.log('Joining class:', coursePath);
  };

  const handleEditCourse = (course: any) => {
    // TODO: 강의 수정 로직 구현
    console.log('Editing course:', course);
  };

  const handleDeleteCourse = (course: any) => {
    // TODO: 강의 삭제 로직 구현
    console.log('Deleting course:', course);
  };

  // 공지사항 불러오기
  useEffect(() => {
    const loadNotices = async () => {
      try {
        setNoticesLoading(true);
        const noticesData = await getNotices();
        setNotices(noticesData);
        setNoticesError(null);
      } catch (error) {
        console.error('Error loading notices:', error);
        setNoticesError('공지사항을 불러오는데 실패했습니다.');
      } finally {
        setNoticesLoading(false);
      }
    };

    loadNotices();
  }, []);

  // 모니터링 데이터 (임시 데이터)
  const communityData: CommunityChartData[] = [
    { date: '2024-01', posts: 35 },
    { date: '2024-02', posts: 42 },
    { date: '2024-03', posts: 58 },
    { date: '2024-04', posts: 47 },
    { date: '2024-05', posts: 65 },
  ];

  const qnaData: QnaChartData[] = [
    { category: '해결됨', value: 45 },
    { category: '진행중', value: 25 },
    { category: '미해결', value: 15 },
  ];

  const commentData: CommentChartData[] = [
    { date: '2024-01', toxic: 12, harassment: 8, hate: 5 },
    { date: '2024-02', toxic: 15, harassment: 10, hate: 7 },
    { date: '2024-03', toxic: 8, harassment: 6, hate: 4 },
    { date: '2024-04', toxic: 14, harassment: 9, hate: 6 },
    { date: '2024-05', toxic: 10, harassment: 7, hate: 3 },
  ];

  const infraData: InfraChartData[] = [
    { time: '00:00', cpu: 45, memory: 60 },
    { time: '04:00', cpu: 35, memory: 55 },
    { time: '08:00', cpu: 65, memory: 75 },
    { time: '12:00', cpu: 85, memory: 85 },
    { time: '16:00', cpu: 75, memory: 80 },
    { time: '20:00', cpu: 55, memory: 65 },
  ];

  return (
    <div className="min-h-screen bg-[#232f3e]">
      {/* Top Navigation Bar */}
      <div className="bg-[#1a232e] text-white p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Nations Lab 관리자 콘솔</h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white hover:bg-[#2c3b4e]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">총 강의 수</h2>
                <p className="text-3xl font-semibold text-[#232f3e]">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">총 학생 수</h2>
                <p className="text-3xl font-semibold text-[#232f3e]">{studentCount}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">총 강사 수</h2>
                <p className="text-3xl font-semibold text-[#232f3e]">{instructorCount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">총 관리자 수</h2>
                <p className="text-3xl font-semibold text-[#232f3e]">{adminCount}</p>
              </div>
              <Settings className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Users Management Section */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-240px)]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#232f3e]" />
                    <h2 className="text-xl font-semibold text-[#232f3e]">사용자 관리</h2>
                  </div>
                  <div className="relative w-64">
                    <Input
                      type="text"
                      placeholder="이름 또는 이메일로 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="overflow-auto h-[calc(100%-65px)]">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232f3e] mx-auto"></div>
                  </div>
                ) : error ? (
                  <div className="p-4">
                    <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                      {error}
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>가입일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.cognito_user_id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{user.given_name || user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                              user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                              {user.role === 'ADMIN' ? '관리자' : 
                               user.role === 'INSTRUCTOR' ? '강사' : '학생'}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('ko-KR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Notices Management Section */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(50vh-120px)]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#232f3e]" />
                    <h2 className="text-xl font-semibold text-[#232f3e]">공지사항 관리</h2>
                  </div>
                  <Button
                    onClick={() => navigate('/admin/notices/create')}
                    className="bg-[#232f3e] hover:bg-[#2c3b4e] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 공지사항
                  </Button>
                </div>
              </div>

              <div className="overflow-auto h-[calc(100%-65px)]">
                {noticesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232f3e] mx-auto"></div>
                  </div>
                ) : noticesError ? (
                  <div className="p-4">
                    <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                      {noticesError}
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>중요</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notices.map((notice) => (
                        <TableRow 
                          key={notice.metadata.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/admin/notices/${notice.metadata.id}`)}
                        >
                          <TableCell className="font-medium">{notice.content.title}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {notice.metadata.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            {notice.metadata.isImportant && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                중요
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* Course Management Section */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(50vh-120px)]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#232f3e]" />
                    <h2 className="text-xl font-semibold text-[#232f3e]">강의 관리</h2>
                  </div>
                  <Button
                    onClick={() => navigate('/admin/courses/create')}
                    className="bg-[#232f3e] hover:bg-[#2c3b4e] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 강의
                  </Button>
                </div>
              </div>
              <div className="overflow-auto h-[calc(100%-65px)]">
                {coursesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232f3e] mx-auto"></div>
                  </div>
                ) : coursesError ? (
                  <div className="p-4">
                    <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                      {coursesError}
                    </div>
                  </div>
                ) : (
                  <CourseList 
                    courses={courses} 
                    userRole="ADMIN" 
                    onJoinClass={handleJoinClass}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Monitoring */}
          <div className="lg:col-span-1 space-y-4">
            {/* 자유게시판 모니터링 */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(25vh-60px)]">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <MessageOutlined className="text-xl text-[#232f3e]" />
                  <h2 className="text-xl font-semibold text-[#232f3e]">자유게시판</h2>
                </div>
              </div>
              <div className="p-3">
                <Row gutter={[8, 0]} className="mb-1">
                  <Col span={8}>
                    <Statistic title="총 게시글" value={247} prefix={<MessageOutlined />} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="오늘 작성" value={12} suffix="개" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="활성 사용자" value={89} suffix="명" />
                  </Col>
                </Row>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={communityData}>
                      <defs>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="posts" stroke="#1890ff" fillOpacity={1} fill="url(#colorPosts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* QNA 모니터링 */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(25vh-60px)]">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <QuestionCircleOutlined className="text-xl text-[#232f3e]" />
                  <h2 className="text-xl font-semibold text-[#232f3e]">QNA</h2>
                </div>
              </div>
              <div className="p-3">
                <Row gutter={[8, 0]} className="mb-1">
                  <Col span={8}>
                    <Statistic title="총 질문" value={85} prefix={<QuestionCircleOutlined />} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="해결률" value={75.5} suffix="%" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="평균 응답" value="2.4" suffix="시간" />
                  </Col>
                </Row>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={qnaData}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={30}
                        fill="#8884d8"
                      >
                        {qnaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#1890ff', '#13c2c2', '#52c41a'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={8} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI 콘텐츠 모더레이션 */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(25vh-60px)]">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <CommentOutlined className="text-xl text-[#232f3e]" />
                  <h2 className="text-xl font-semibold text-[#232f3e]">AI 콘텐츠 모더레이션</h2>
                </div>
              </div>
              <div className="p-3">
                <Row gutter={[8, 0]} className="mb-1">
                  <Col span={8}>
                    <Statistic 
                      title="위험 수준" 
                      value="중간" 
                      valueStyle={{ color: '#faad14' }}
                      prefix={<CommentOutlined />} 
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="자동 검출률" 
                      value={92.5} 
                      suffix="%" 
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="검토 대기" 
                      value={15} 
                      suffix="건"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                </Row>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commentData} barSize={12}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend iconSize={8} iconType="circle" />
                      <Bar dataKey="toxic" name="유해성" stackId="a" fill="#ff4d4f" />
                      <Bar dataKey="harassment" name="괴롭힘" stackId="a" fill="#faad14" />
                      <Bar dataKey="hate" name="혐오" stackId="a" fill="#cf1322" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 인프라 모니터링 */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(25vh-60px)]">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <CloudServerOutlined className="text-xl text-[#232f3e]" />
                  <h2 className="text-xl font-semibold text-[#232f3e]">인프라</h2>
                </div>
              </div>
              <div className="p-3">
                <Row gutter={[8, 0]} className="mb-1">
                  <Col span={8}>
                    <Statistic title="서버 상태" value="정상" className="text-green-500" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="응답 시간" value={248} suffix="ms" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="가용성" value={99.9} suffix="%" />
                  </Col>
                </Row>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={infraData}>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend iconSize={8} iconType="circle" />
                      <Line type="monotone" dataKey="cpu" stroke="#1890ff" name="CPU" />
                      <Line type="monotone" dataKey="memory" stroke="#13c2c2" name="Memory" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 