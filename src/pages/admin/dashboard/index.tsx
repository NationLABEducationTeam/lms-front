import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Settings,
  BarChart3,
  GraduationCap,
  FileText,
  Bell,
  Search,
  Eye,
  Activity
} from 'lucide-react';
import { Card } from '@/components/common/ui/card';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { getAllUsers } from '@/services/api/users';
import { DBUser } from '@/types/user';
import { Input } from "@/components/common/ui/input";
import { listAllCourses } from '@/services/api/courses';
import { Course } from '@/types/course';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  helpText?: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon: Icon, helpText }) => (
  <Card className="p-6 bg-white">
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
        {helpText && (
          <div className="text-sm text-gray-600 mt-2">
            {helpText}
          </div>
        )}
      </div>
      <div className="text-blue-500">
        <Icon size={40} />
      </div>
    </div>
  </Card>
);

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  metric?: string;
  metricLabel?: string;
}

const DashboardCard: FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  onClick,
  metric,
  metricLabel
}) => (
  <Card
    className="p-6 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {metric && (
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{metric}</p>
            <p className="text-sm text-gray-600">{metricLabel}</p>
          </div>
        )}
      </div>
    </div>
  </Card>
);

const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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

  const fetchAllCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await listAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllCourses();
  }, []);

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

  const stats: StatCardProps[] = [
    {
      title: '총 방문자 수',
      value: '52',
      icon: Eye,
      helpText: '지난 주 대비 12% 증가',
    },
    {
      title: '수강생 수',
      value: String(users.filter(u => u.role === 'STUDENT').length),
      icon: Users,
      helpText: '신규 가입 1명',
    },
    {
      title: '개설된 클래스',
      value: String(courses.length),
      icon: BookOpen,
      helpText: '진행중인 클래스',
    },
    {
      title: '활성도',
      value: '0',
      icon: Activity,
      helpText: '오늘의 활동',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="mt-1 text-sm text-gray-600">
              강의, 학생, 시스템 설정을 관리할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              onClick={() => navigate('/admin/courses/create')}
            >
              <BookOpen className="w-4 h-4" />
              <span>새 강의 생성</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="강의 관리"
            description="강의 목록을 확인하고 새로운 강의를 생성합니다."
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            onClick={() => navigate('/admin/courses')}
            metric={coursesLoading ? "..." : String(courses.length)}
            metricLabel="총 강의 수"
          />
          
          <DashboardCard
            title="학생 관리"
            description="등록된 학생들의 정보와 수강 현황을 관리합니다."
            icon={<Users className="w-5 h-5 text-green-600" />}
            onClick={() => navigate('/admin/students')}
            metric={String(users.filter(u => u.role === 'STUDENT').length)}
            metricLabel="등록된 학생 수"
          />

          <DashboardCard
            title="시스템 설정"
            description="시스템 환경 설정 및 권한을 관리합니다."
            icon={<Settings className="w-5 h-5 text-purple-600" />}
            onClick={() => navigate('/admin/settings')}
          />

          <DashboardCard
            title="통계"
            description="강의별 수강생 통계와 학습 현황을 확인합니다."
            icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
            onClick={() => navigate('/admin/statistics')}
          />

          <DashboardCard
            title="수료 관리"
            description="학생들의 강의 수료 현황을 관리합니다."
            icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
            onClick={() => navigate('/admin/certifications')}
          />

          <DashboardCard
            title="공지사항"
            description="시스템 공지사항을 관리합니다."
            icon={<FileText className="w-5 h-5 text-red-600" />}
            onClick={() => navigate('/admin/notices')}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">사용자 관리</h2>
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

          <div className="overflow-hidden rounded-lg border border-gray-200">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
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

        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">새로운 강의가 생성되었습니다.</span>
              </div>
              <span className="text-xs text-gray-500">방금 전</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600">시스템 설정이 업데이트되었습니다.</span>
              </div>
              <span className="text-xs text-gray-500">1시간 전</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">공지사항</h2>
            <button 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => navigate('/admin/notices')}
            >
              전체보기
            </button>
          </div>
          
          {noticesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : noticesError ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              {noticesError}
            </div>
          ) : (
            <div className="space-y-4">
              {notices.slice(0, 5).map((notice) => (
                <div key={notice.metadata.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <h3 className="font-medium text-gray-900">{notice.content.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${notice.metadata.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {notice.metadata.status === 'active' ? '게시됨' : '임시저장'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;