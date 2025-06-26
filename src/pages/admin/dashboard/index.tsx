import { FC, useEffect, useState, Suspense } from 'react';
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
  Activity,
  PlusCircle,
  TrendingUp,
  Clock,
  CalendarDays,
  MessageSquare,
  Video,
  Zap,
  RefreshCw,
  X,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/ui/card';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { getAllUsers } from '@/services/api/users';
import { DBUser } from '@/types/user';
import { Input } from "@/components/common/ui/input";
import { listPublicCourses } from '@/services/api/courses';
import { Course } from '@/types/course';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// '최근 활동' 데이터 타입을 정의합니다.
interface RecentActivity {
  id: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  text: string;
  time: string;
  link: string;
}

// 임시 Skeleton 컴포넌트 (ui 컴포넌트가 없는 경우)
const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

// 간단한 DropdownMenu 구현 (ui 컴포넌트가 없는 경우)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => children;
const DropdownMenuTrigger = ({ onClick, children }: { onClick?: (e: React.MouseEvent) => void, children: React.ReactNode }) => 
  <div onClick={onClick}>{children}</div>;
const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => 
  <div className="fixed right-4 z-50 mt-8 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
    {children}
  </div>;
const DropdownMenuItem = ({ onClick, children }: { onClick?: (e: React.MouseEvent) => void, children: React.ReactNode }) => 
  <div onClick={onClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{children}</div>;
const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => 
  <div className="px-4 py-2 text-xs text-gray-500">{children}</div>;
const DropdownMenuSeparator = () => <hr className="my-1" />;

// 로딩 스켈레톤 컴포넌트
const StatCardSkeleton: FC = () => (
  <Card className="p-6 bg-white">
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </Card>
);

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  helpText?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
}

const StatCard: FC<StatCardProps> = ({ 
  title, value, icon: Icon, helpText, trend, trendValue, isLoading 
}) => {
  if (isLoading) return <StatCardSkeleton />;

  return (
    <Card className="p-6 bg-white hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
          {helpText && (
            <div className="flex items-center text-sm mt-2">
              {trend && (
                <span className={`mr-1 ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3 inline mr-1" /> : 
                   trend === 'down' ? <TrendingUp className="h-3 w-3 inline mr-1 transform rotate-180" /> : null}
                  {trendValue}
                </span>
              )}
              <span className="text-gray-600">{helpText}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full 
          ${title.includes('방문자') ? 'bg-blue-100 text-blue-600' : 
           title.includes('수강생') ? 'bg-green-100 text-green-600' : 
           title.includes('클래스') ? 'bg-purple-100 text-purple-600' : 
           'bg-amber-100 text-amber-600'}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

// 액션 카드 컴포넌트
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  metric?: string;
  metricLabel?: string;
  isLoading?: boolean;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
}

const ActionCard: FC<ActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  metric,
  metricLabel,
  isLoading,
  actions
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50">
              {icon}
            </div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          {actions && (
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative z-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actions.map((action, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {(metric || metricLabel) && (
        <CardContent>
          {metric && <p className="text-2xl font-bold">{metric}</p>}
          {metricLabel && <p className="text-sm text-gray-500">{metricLabel}</p>}
        </CardContent>
      )}
    </Card>
  );
};

// 알림 항목 컴포넌트
interface NotificationItemProps {
  title: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const NotificationItem: FC<NotificationItemProps> = ({
  title,
  time,
  type
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex items-center py-3 border-b last:border-0">
      <div className={`w-2 h-2 rounded-full mr-3 ${
        type === 'success' ? 'bg-green-500' :
        type === 'warning' ? 'bg-yellow-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
      }`} />
      <div className="flex-1">
        <p className="text-sm text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

// 퀵 액션 버튼
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

const QuickAction: FC<QuickActionProps> = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${color} hover:opacity-90`}
  >
    <div className="mb-2">{icon}</div>
    <span className="text-xs font-medium text-center">{label}</span>
  </button>
);

// 메인 대시보드 컴포넌트
const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // 데이터 페칭 함수
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const courses = await listPublicCourses();
      setCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchNotices = async () => {
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

  const fetchRecentActivities = async () => {
    // TODO: 추후 API 연동을 통해 실제 최근 활동 데이터를 가져옵니다.
    // 예: const data = await getRecentActivities();
    // setRecentActivities(data);
    
    // 현재는 비어 있는 상태로 둡니다.
    setRecentActivities([]);
  };

  // 페이지 로드시 데이터 패치
  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchCourses(),
      fetchNotices(),
      fetchRecentActivities(),
    ]);
  }, []);

  // 데이터 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchCourses(),
        fetchNotices(),
        fetchRecentActivities(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 통계 카드 데이터
  const stats = [
    {
      title: '총 방문자 수',
      value: '-',
      icon: Eye,
      helpText: '-',
      trend: 'neutral' as const,
      trendValue: '',
      isLoading: false,
    },
    {
      title: '수강생 수',
      value: String(users.filter(u => u.role === 'STUDENT').length),
      icon: Users,
      helpText: '지난 주 대비 5% 증가',
      trend: 'up' as const,
      trendValue: '5%',
      isLoading: loading,
    },
    {
      title: '개설된 클래스',
      value: String(courses.length),
      icon: BookOpen,
      helpText: '진행중인 클래스',
      isLoading: coursesLoading,
    },
    {
      title: '활성도',
      value: '-',
      icon: Activity,
      helpText: '오늘의 활동',  
      trend: 'neutral' as const,
      trendValue: '',
      isLoading: false,
    },
  ];

  // 알림 데이터 (예시)
  const notifications = [
    { 
      title: '새로운 수강생 5명이 등록되었습니다.', 
      time: '10분 전', 
      type: 'info' as const 
    },
    { 
      title: '강의 자료가 성공적으로 업로드되었습니다.', 
      time: '1시간 전', 
      type: 'success' as const 
    },
    { 
      title: '서버 유지보수가 예정되어 있습니다.', 
      time: '2시간 전', 
      type: 'warning' as const 
    },
    { 
      title: '강의 평가 제출 기한이 임박했습니다.', 
      time: '3시간 전', 
      type: 'error' as const 
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="mt-1 text-sm text-gray-600">
              현재 시간: {format(new Date(), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white"
            >
              <RefreshCw 
                className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
              />
              새로고침
            </Button>
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`bg-white relative ${showNotifications ? 'ring-2 ring-blue-500' : ''}`}
              >
                <Bell className="w-4 h-4 mr-2" />
                알림
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  4
                </span>
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  <div className="p-3 border-b flex items-center justify-between">
                    <h3 className="font-medium">알림</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-3">
                    {notifications.map((notification, index) => (
                      <NotificationItem
                        key={index}
                        title={notification.title}
                        time={notification.time}
                        type={notification.type}
                      />
                    ))}
                  </div>
                  <div className="p-3 border-t">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="w-full justify-center"
                      onClick={() => navigate('/admin/notifications')}
                    >
                      모든 알림 보기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 퀵 액션 섹션 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          <QuickAction
            icon={<BookOpen className="w-6 h-6 text-white" />}
            label="새 강의 생성"
            onClick={() => navigate('/admin/courses/create')}
            color="bg-blue-600 text-white"
          />
          <QuickAction
            icon={<Video className="w-6 h-6 text-white" />}
            label="수업 모니터링"
            onClick={() => navigate('/admin/monitoring')}
            color="bg-purple-600 text-white"
          />
          <QuickAction
            icon={<FileText className="w-6 h-6 text-white" />}
            label="공지사항 작성"
            onClick={() => navigate('/admin/notices/create')}
            color="bg-amber-600 text-white"
          />
          <QuickAction
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            label="통계 보기"
            onClick={() => navigate('/admin/statistics')}
            color="bg-indigo-600 text-white"
          />
        </div>

        {/* 통계 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* 관리 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="강의 관리"
            description="강의 목록 확인 및 강의 컨텐츠 관리"
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            onClick={() => navigate('/admin/courses')}
            metric={coursesLoading ? "로딩 중..." : String(courses.length)}
            metricLabel="총 강의 수"
            isLoading={coursesLoading}
          />
          
          <ActionCard
            title="학생 관리"
            description="학생 정보 및 수강 현황 관리"
            icon={<Users className="w-5 h-5 text-green-600" />}
            onClick={() => navigate('/admin/students')}
            metric={loading ? "로딩 중..." : String(users.filter(u => u.role === 'STUDENT').length)}
            metricLabel="등록된 학생 수"
            isLoading={loading}
          />

          <ActionCard
            title="수업 모니터링"
            description="실시간 수업 및 예정된 수업 관리"
            icon={<Video className="w-5 h-5 text-purple-600" />}
            onClick={() => navigate('/admin/monitoring')}
            isLoading={false}
          />

          <ActionCard
            title="통계"
            description="강의별 수강생 통계와 학습 현황"
            icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
            onClick={() => navigate('/admin/statistics')}
            isLoading={false}
          />

          <ActionCard
            title="수료 관리"
            description="학생들의 강의 수료 현황 관리"
            icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
            onClick={() => navigate('/admin/certificates')}
            isLoading={false}
          />

          <ActionCard
            title="공지사항"
            description="시스템 공지사항 관리"
            icon={<FileText className="w-5 h-5 text-red-600" />}
            onClick={() => navigate('/admin/notices')}
            metric={noticesLoading ? "로딩 중..." : String(notices.length)}
            metricLabel="등록된 공지 수"
            isLoading={noticesLoading}
          />
        </div>

        {/* 최근 활동 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center border-b pb-4 last:border-b-0">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-full ${activity.bgColor} ${activity.iconColor} mr-4`}>
                      <activity.icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <button 
                      onClick={() => navigate(activity.link)} 
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      보기
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">최근 활동 내역이 없습니다.</h3>
                <p className="mt-1 text-sm text-gray-500">새로운 활동이 생기면 여기에 표시됩니다.</p>
              </div>
            )}
            {recentActivities.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-blue-600"
                  onClick={() => navigate('/admin/activity')}
                >
                  모든 활동 보기
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;