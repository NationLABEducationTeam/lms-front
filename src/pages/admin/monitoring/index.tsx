import { FC, useState, useEffect, useRef } from 'react';
import { useGetDashboardSummaryQuery } from '@/services/api/zoomApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { Badge } from '@/components/common/ui/badge';
import { Button } from '@/components/common/ui/button';
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  ExternalLink, 
  BookOpen, 
  RefreshCw, 
  BarChart2, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Link2,
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, format, differenceInMinutes, differenceInHours } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';
import { Input } from '@/components/common/ui/input';
import { Progress } from '@/components/common/ui/progress';

// HSL 색상 변수 정의
const colors = {
  primary: 'hsl(212, 64%, 52%)',
  primaryLight: 'hsl(212, 64%, 95%)',
  success: 'hsl(145, 63%, 42%)',
  successLight: 'hsl(145, 63%, 95%)',
  warning: 'hsl(45, 93%, 47%)',
  warningLight: 'hsl(45, 93%, 97%)',
  error: 'hsl(355, 70%, 55%)',
  errorLight: 'hsl(355, 70%, 95%)',
  neutral: 'hsl(210, 16%, 82%)',
  neutralLight: 'hsl(210, 16%, 97%)',
};

// 로딩 스켈레톤 컴포넌트
const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// 위젯 컨테이너 컴포넌트
interface WidgetProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  loadingHeight?: string;
  footer?: React.ReactNode;
  id?: string;
}

const Widget: FC<WidgetProps> = ({ 
  children, 
  className, 
  title, 
  description, 
  actions, 
  isLoading, 
  loadingHeight = "h-40",
  footer,
  id
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (widgetRef.current) {
      observer.observe(widgetRef.current);
    }

    return () => {
      if (widgetRef.current) {
        observer.unobserve(widgetRef.current);
      }
    };
  }, []);

  return (
    <Card 
      ref={widgetRef} 
      className={`overflow-hidden shadow-sm transition-all duration-200 border-0 ${className}`}
      id={id}
    >
      {(title || description || actions) && (
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <div>
            {title && <CardTitle className="text-lg font-medium">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={isLoading ? 'p-0' : ''}>
        {isLoading ? (
          <div className={`flex items-center justify-center w-full ${loadingHeight}`}>
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className={isVisible ? 'animate-fadeIn' : 'opacity-0'}>
            {children}
          </div>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="border-t px-6 py-3 bg-gray-50">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

// 상태 배지 컴포넌트
interface StatusBadgeProps {
  status: 'active' | 'upcoming' | 'completed' | 'error';
  count?: number;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, count }) => {
  let bgColor = '';
  let textColor = '';
  let icon = null;

  switch (status) {
    case 'active':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
      break;
    case 'upcoming':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <Calendar className="w-3 h-3 mr-1" />;
      break;
    case 'completed':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = <Clock className="w-3 h-3 mr-1" />;
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <XCircle className="w-3 h-3 mr-1" />;
      break;
  }

  return (
    <Badge className={`${bgColor} ${textColor} flex items-center justify-center`}>
      {icon}
      <span>
        {status === 'active' && '진행 중'}
        {status === 'upcoming' && '예정됨'}
        {status === 'completed' && '종료됨'}
        {status === 'error' && '오류'}
        {count !== undefined && ` (${count})`}
      </span>
    </Badge>
  );
};

// 날짜 포맷 헬퍼 함수
const formatSafeDate = (
  dateString: string | null | undefined, 
  formatStr: string = 'yyyy년 MM월 dd일 HH:mm',
  defaultValue: string = '날짜 정보 없음'
): string => {
  try {
    if (!dateString) return defaultValue;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return defaultValue;
    }
    return format(date, formatStr, { locale: ko });
  } catch (error) {
    console.error('Date formatting error:', error);
    return defaultValue;
  }
};

// 진행 시간 표시 컴포넌트
interface DurationDisplayProps {
  startTime: string;
  endTime?: string;
  showLabel?: boolean;
}

const DurationDisplay: FC<DurationDisplayProps> = ({ startTime, endTime, showLabel = true }) => {
  try {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    
    if (isNaN(start.getTime())) {
      return <div className="text-gray-500">유효하지 않은 시간</div>;
    }
    
    const durationMinutes = differenceInMinutes(end, start);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 mr-1 text-gray-500" />
          {hours > 0 ? (
            <span>{hours}시간 {minutes}분</span>
          ) : (
            <span>{minutes}분</span>
          )}
        </div>
        {showLabel && (
          <div className="text-xs text-gray-500 mt-1">
            {formatSafeDate(startTime, 'HH:mm')} ~ {endTime ? formatSafeDate(endTime, 'HH:mm') : '현재'}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Duration display error:', error);
    return <div className="text-gray-500">시간 정보를 표시할 수 없음</div>;
  }
};

// Meeting 인터페이스를 API 응답 구조에 맞게 수정
interface Meeting {
  id: string | number;
  topic: string;
  host_id: string;
  start_time: string;
  duration: number;
  course_title: string | null;
  enrolled_students_count: number;
  current_attendance_rate: string;
  active_participants_count: number;
  total_participants_count: number;
  meeting_duration_minutes: number;
  meeting_duration_formatted: string;
  meeting_info?: {
    start_time: string;
    duration_formatted: string;
    duration_seconds: number;
    duration_minutes: number;
  };
  active_participants: Array<{
    name: string;
    email: string;
    duration_minutes: number;
    duration_formatted: string;
    first_join_time: string;
    is_active: boolean;
    session_count: number;
    attendance_rate: number;
    timeline_data: Array<{
      type: 'gap' | 'session';
      position_start: number;
      position_end: number;
      position_width: number;
      session_index?: number;
      join_time?: string;
      leave_time?: string | null;
      duration_seconds?: number;
      duration_formatted?: string;
      is_active?: boolean;
    }>;
    sessions: Array<{
      join_time: string;
      leave_time: string | null;
      duration_formatted: string;
      position_start: number;
      position_end: number;
      position_width: number;
      is_active: boolean;
    }>;
  }>;
  recent_past_participants: Array<{
    name: string;
    email: string;
    duration_minutes: number;
    duration_formatted: string;
    first_join_time: string;
    last_leave_time: string;
    is_active: boolean;
    session_count: number;
    attendance_rate: number;
    timeline_data: Array<{
      type: 'gap' | 'session';
      position_start: number;
      position_end: number;
      position_width: number;
      session_index?: number;
      join_time?: string;
      leave_time?: string | null;
      duration_seconds?: number;
      duration_formatted?: string;
      is_active?: boolean;
    }>;
    sessions: Array<{
      join_time: string;
      leave_time: string;
      duration_formatted: string;
      position_start: number;
      position_end: number;
      position_width: number;
      is_active: boolean;
    }>;
  }>;
  all_participants?: Array<{
    name: string;
    email: string;
    duration_minutes: number;
    duration_formatted: string;
    first_join_time: string;
    last_leave_time?: string;
    is_active: boolean;
    session_count: number;
    attendance_rate: number;
    timeline_data: Array<{
      type: 'gap' | 'session';
      position_start: number;
      position_end: number;
      position_width: number;
      session_index?: number;
      join_time?: string;
      leave_time?: string | null;
      duration_seconds?: number;
      duration_formatted?: string;
      is_active?: boolean;
    }>;
    sessions: Array<{
      join_time: string;
      leave_time: string | null;
      duration_formatted: string;
      position_start: number;
      position_end: number;
      position_width: number;
      is_active: boolean;
    }>;
  }>;
}

// 참가자 타입과 세션 타임라인 컴포넌트 인터페이스 정의
interface ParticipantWithStatus {
  name: string;
  email: string;
  duration_minutes: number;
  duration_formatted: string;
  first_join_time: string;
  last_leave_time?: string;
  is_active: boolean;
  session_count: number;
  attendance_rate: number;
  status: 'active' | 'past';
  timeline_data: Array<{
    type: 'gap' | 'session';
    position_start: number;
    position_end: number;
    position_width: number;
    session_index?: number;
    join_time?: string;
    leave_time?: string | null;
    duration_seconds?: number;
    duration_formatted?: string;
    is_active?: boolean;
  }>;
  sessions: Array<{
    join_time: string;
    leave_time: string | null;
    duration_formatted: string;
    position_start: number;
    position_end: number;
    position_width: number;
    is_active: boolean;
  }>;
}

// 세션 타임라인 컴포넌트 인터페이스
interface SessionTimelineProps {
  timelineData?: ParticipantWithStatus['timeline_data'];
  sessions?: ParticipantWithStatus['sessions'];
  isActive: boolean;
  attendanceRate?: number;
}

// 세션 타임라인 컴포넌트 완전히 다시 작성
const SessionTimeline: FC<SessionTimelineProps> = ({ 
  timelineData, 
  sessions,
  isActive,
  attendanceRate: providedAttendanceRate 
}) => {
  // timeline_data가 없으면 오류 메시지 표시하고 빈 컴포넌트 반환
  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="text-xs text-red-500 font-medium">타임라인 데이터 없음</div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="h-full bg-gray-300 rounded-full" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  // API에서 제공한 출석률 사용
  const attendanceRateValue = providedAttendanceRate ?? 0;
  // 진행된 시간 표시 (100%에 비례하여 표시)
  const meetingProgressRate = Math.min(100, attendanceRateValue);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      
      {/* 타임라인 컨테이너 */}
      <div className="relative w-full h-5 bg-gray-100 rounded-lg overflow-hidden">
        {/* 중간 50% 지점 마커 */}
        <div className="absolute h-full w-px bg-gray-400 left-1/2 z-20"></div>
        
        {/* 각 세션별 참여 시각화 - 배경에 미참여 영역은 기본 회색, 참여 영역은 파란색 또는 녹색으로 표시 */}
        {timelineData.map((segment, index) => {
          const style = { 
            width: `${segment.position_width}%`,
            left: `${segment.position_start}%`
          };
          
          if (segment.type === 'gap') {
            // 미참여 구간 시간 정보 안전하게 추출
            let gapStartTime = '시작';
            let gapEndTime = '현재';
            
            // 미참여 구간 시작 시간 (이전 세션의 끝 또는 수업 시작)
            if (segment.position_start === 0) {
              // 첫 번째 갭은 수업 시작부터 첫 참여까지
              const nextSegment = timelineData.find(s => s.type === 'session');
              gapStartTime = '수업 시작';
              gapEndTime = nextSegment?.join_time ? formatSafeDate(nextSegment.join_time, 'HH:mm') : '?';
            } else {
              // 중간 갭은 이전 세션 종료부터 다음 세션 시작까지
              const prevSegment = timelineData[index-1];
              const nextSegment = timelineData[index+1];
              
              gapStartTime = prevSegment?.leave_time ? formatSafeDate(prevSegment.leave_time, 'HH:mm') : '?';
              gapEndTime = nextSegment?.join_time ? formatSafeDate(nextSegment.join_time, 'HH:mm') : '?';
            }
            
            const tooltipText = `미참여 구간: ${gapStartTime} ~ ${gapEndTime}`;
            
            return (
              <div 
                key={`gap-${index}`}
                className="absolute h-full bg-gray-200 group cursor-help"
                style={style}
              >
                <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded whitespace-nowrap z-50">
                  {tooltipText}
                </div>
              </div>
            );
          } else if (segment.type === 'session') {
            // 참여 세션 렌더링
            const joinTime = segment.join_time ? formatSafeDate(segment.join_time, 'HH:mm') : '?';
            const leaveTime = segment.leave_time ? formatSafeDate(segment.leave_time, 'HH:mm') : '현재';
            const tooltipText = `참여: ${joinTime} ~ ${leaveTime} (${segment.duration_formatted || '?'})`;
            
            return (
              <div 
                key={`session-${index}`}
                className={`absolute h-full ${segment.is_active ? 'bg-green-500' : 'bg-blue-400'} group cursor-help`}
                style={style}
              >
                <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded whitespace-nowrap z-50">
                  {tooltipText}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      
      {/* 출석률 및 범례 */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>현재 참여</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
            <span>이전 참여</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-200 rounded-full mr-1"></div>
            <span>미참여</span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={
            attendanceRateValue >= 80 ? 'bg-green-100 text-green-700' : 
            attendanceRateValue >= 50 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }
        >
          출석률: {attendanceRateValue.toFixed(1)}%
        </Badge>
      </div>
      
      {/* 세션 정보 표 */}
      {sessions && sessions.length > 0 && (
        <div className="mt-2 pt-1 border-t border-gray-200">
          <div className="mb-1 flex justify-between items-center">
            <div className="text-xs font-medium text-gray-700">세션 기록 ({sessions.length}개)</div>
            {isActive && <Badge variant="outline" className="text-xs bg-green-50 text-green-600">참여중</Badge>}
          </div>
          <div className="space-y-1 text-xs">
            {sessions.map((session, idx) => (
              <div 
                key={idx} 
                className={`flex justify-between py-1 px-2 rounded ${
                  session.is_active 
                    ? 'bg-green-50 border-l-2 border-green-500' 
                    : 'bg-gray-50 border-l-2 border-gray-300'
                }`}
              >
                <span className="font-medium">
                  {formatSafeDate(session.join_time, 'HH:mm')} ~ {session.leave_time ? formatSafeDate(session.leave_time, 'HH:mm') : '현재'}
                </span>
                <span className={session.is_active ? 'font-medium text-green-600' : ''}>
                  {session.duration_formatted}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 메인 모니터링 페이지 컴포넌트
const MonitoringPage: FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();
  const [refreshing, setRefreshing] = useState(false);

  // 디버깅을 위해 데이터 구조 로그 출력
  useEffect(() => {
    if (data) {
      console.log('API 응답 데이터 구조:', data);
      if (data.data?.live_meetings?.meetings?.length) {
        console.log('현재 진행 중인 강의 수:', data.data.live_meetings.meetings.length);
      } else {
        console.error('진행 중인 강의 데이터가 없음:', data);
      }
    }
  }, [data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // 데이터 필터링 함수
  const filterMeetingsBySearch = (meetings: any[] = []) => {
    if (!searchTerm.trim()) return meetings;
    
    return meetings.filter(meeting => 
      meeting.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.course_title && meeting.course_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // 필터링된 데이터 - API 응답 구조에 맞게 수정
  const filteredActiveMeetings = filterMeetingsBySearch(data?.data?.live_meetings?.meetings || []);
  const filteredUpcomingMeetings = filterMeetingsBySearch(data?.data?.upcoming_meetings?.meetings || []);
  const filteredRecentMeetings = filterMeetingsBySearch(data?.data?.recent_past_meetings?.meetings || []);

  // 모니터링 대시보드 통계 - API 응답 구조에 맞게 수정
  const stats = [
    {
      title: '진행 중인 수업',
      value: data?.data?.live_meetings?.count || 0,
      icon: <Video className="w-6 h-6 text-white" />,
      color: 'bg-emerald-600',
      linkTo: '#active-meetings'
    },
    {
      title: '예정된 수업',
      value: data?.data?.upcoming_meetings?.count || 0,
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: 'bg-blue-600',
      linkTo: '#upcoming-meetings'
    },
    {
      title: '종료된 수업',
      value: data?.data?.recent_past_meetings?.count || 0,
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      color: 'bg-gray-600',
      linkTo: '#recent-meetings'
    },
    {
      title: '전체 참가자',
      value: data?.data?.live_meetings?.meetings?.reduce((total, meeting) => total + (meeting.total_participants_count || 0), 0) || 0,
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-indigo-600'
    }
  ];
  
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Widget
          key={index}
          className="border-0 shadow-sm"
          isLoading={isLoading}
          loadingHeight="h-24"
        >
          <a href={stat.linkTo} className="block">
            <div className="flex items-center p-1">
              <div className={`${stat.color} rounded-lg p-4 mr-4`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-3xl font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          </a>
        </Widget>
      ))}
    </div>
  );

  const renderActiveMeetings = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      console.error('API 오류:', error);
      return (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-500 mb-4">
              {error instanceof Error ? error.message : '알 수 없는 오류'}
            </div>
            <Button onClick={handleRefresh}>다시 시도</Button>
          </CardContent>
        </Card>
      );
    }

    // API 응답 구조 체크 로직에 디버깅 추가
    console.log('데이터 확인:', data);
    
    if (!data || !data.data || !data.data.live_meetings || !data.data.live_meetings.meetings || data.data.live_meetings.meetings.length === 0) {
      console.warn('진행 중인 강의가 없음:', {
        hasData: !!data,
        hasDataProp: data ? !!data.data : false,
        hasLiveMeetings: data?.data ? !!data.data.live_meetings : false,
        hasMeetings: data?.data?.live_meetings ? !!data.data.live_meetings.meetings : false,
        meetingsLength: data?.data?.live_meetings?.meetings?.length || 0
      });
      
      return (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>진행 중인 수업 없음</CardTitle>
            <CardDescription>현재 진행 중인 실시간 수업이 없습니다.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    // 진행 중인 강의가 있는 경우 렌더링
    console.log('진행 중인 강의 렌더링:', data.data.live_meetings.meetings.length);
    
    return (
      <div className="space-y-4">
        {data.data.live_meetings.meetings.map((meeting: any) => {
          if (!meeting) return null;
          
          // all_participants 속성이 있는지 확인
          const hasAllParticipants = 'all_participants' in meeting && Array.isArray(meeting.all_participants);
          
          // all_participants가 있으면 그것을 사용하고, 없으면 active_participants와 recent_past_participants 병합
          const allParticipants: ParticipantWithStatus[] = hasAllParticipants 
            ? (meeting.all_participants as any[]).map((p: any) => ({...p, status: p.is_active ? 'active' as const : 'past' as const}))
            : [
                ...(meeting.active_participants || []).map((p: any) => ({...p, status: 'active' as const, last_leave_time: undefined})),
                ...(meeting.recent_past_participants || []).map((p: any) => ({...p, status: 'past' as const}))
              ];

          // 이메일 기준으로 중복 제거
          const uniqueParticipants = hasAllParticipants 
            ? allParticipants
            : allParticipants.reduce((acc, current) => {
                if (!current.email) {
                  acc.push(current);
                  return acc;
                }
                
                const existing = acc.find(item => item.email && item.email === current.email);
                if (existing) {
                  // 이미 목록에 있는 경우, 활성 상태인 참가자를 우선시
                  if (current.status === 'active') {
                    const index = acc.indexOf(existing);
                    acc[index] = current;
                  }
                } else {
                  acc.push(current);
                }
                return acc;
              }, [] as ParticipantWithStatus[]);
          
          return (
            <Card key={meeting.id} className="overflow-hidden border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                    <CardDescription>
                      시작: {formatSafeDate(meeting.start_time)}
                    </CardDescription>
                    {meeting.course_title && 
                      <CardDescription className="mt-1">
                        강의: {meeting.course_title}
                      </CardDescription>
                    }
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.meeting_duration_formatted} / 총 {meeting.duration}분
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        현재 참가자: {meeting.active_participants_count}명 / 총 참가자: {meeting.total_participants_count}명
                      </Badge>
                      {meeting.enrolled_students_count > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-100">
                          <BookOpen className="h-3 w-3" />
                          출석률: {meeting.current_attendance_rate}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-500">진행 중</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        현재 참가자: {meeting.active_participants_count}명 / 총 참가자: {meeting.total_participants_count}명
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        예정된 시간: {meeting.duration}분 / 현재 진행 시간: {meeting.meeting_duration_formatted} ({(meeting.meeting_duration_minutes / meeting.duration * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <a 
                      href={`https://zoom.us/j/${meeting.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Zoom에서 보기
                    </a>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>참여 정보</TableHead>
                        <TableHead>참여 타임라인</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueParticipants.map((participant, index) => {
                        if (!participant) return null;
                        
                        return (
                          <TableRow 
                            key={`${meeting.id}-participant-${participant.email || index}`}
                            className={participant.status === 'active' ? '' : 'bg-slate-50/50'}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {participant.name}
                                {participant.status === 'active' && (
                                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{participant.email || '-'}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{participant.duration_formatted}</div>
                                <div className="text-xs text-gray-500">
                                  {formatSafeDate(participant.first_join_time, 'HH:mm')}부터 참여
                                  {participant.status === 'past' && participant.last_leave_time && (
                                    <> ~ {formatSafeDate(participant.last_leave_time, 'HH:mm')} 퇴장</>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>실제 참여율: </span>
                                  <span className="font-medium">
                                    {participant.attendance_rate.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-64">
                              <SessionTimeline
                                timelineData={participant.timeline_data}
                                sessions={participant.sessions}
                                isActive={participant.status === 'active'}
                                attendanceRate={participant.attendance_rate}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderUpcomingMeetings = () => {
    if (error) {
      return (
        <Widget
          className="border-l-4 border-l-red-500 bg-red-50"
          title="오류 발생"
          description="데이터를 불러오는 중 오류가 발생했습니다."
          actions={
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          }
        >
          <div className="p-4 text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2 inline-block" />
            <span>API 요청 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.</span>
          </div>
        </Widget>
      );
    }

    if (filteredUpcomingMeetings.length === 0 && !isLoading) {
      return (
        <Widget 
          className="border-l-4 border-l-gray-200 bg-gray-50"
          title="예정된 수업 없음"
          description="현재 예정된 실시간 수업이 없습니다."
        >
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Calendar className="w-12 h-12 mb-4 text-gray-300" />
            <p>예정된 수업이 없습니다.</p>
          </div>
        </Widget>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUpcomingMeetings.map((meeting) => (
          <Widget 
            key={meeting.id}
            className="border-l-4 border-l-blue-500"
            title={meeting.topic}
            actions={<StatusBadge status="upcoming" />}
          >
            <div className="space-y-4 p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  <span>{formatSafeDate(meeting.start_time)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-600" />
                  <span>예상 소요 시간: {meeting.duration}분</span>
                </div>
              </div>
              
              <div className="border-t pt-3 flex justify-end">
                <a 
                  href={meeting.join_url || `https://zoom.us/j/${meeting.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  회의 링크
                </a>
              </div>
            </div>
          </Widget>
        ))}
      </div>
    );
  };

  const renderRecentMeetings = () => {
    if (error) {
      return (
        <Widget
          className="border-l-4 border-l-red-500 bg-red-50"
          title="오류 발생"
          description="데이터를 불러오는 중 오류가 발생했습니다."
          actions={
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          }
        >
          <div className="p-4 text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2 inline-block" />
            <span>API 요청 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.</span>
          </div>
        </Widget>
      );
    }

    if (filteredRecentMeetings.length === 0 && !isLoading) {
      return (
        <Widget 
          className="border-l-4 border-l-gray-200 bg-gray-50"
          title="최근 종료된 수업 없음"
          description="최근 7일 이내에 종료된 수업이 없습니다."
        >
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Clock className="w-12 h-12 mb-4 text-gray-300" />
            <p>최근 종료된 수업이 없습니다.</p>
          </div>
        </Widget>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecentMeetings.map((meeting) => (
          <Widget 
            key={meeting.id}
            className="border-l-4 border-l-gray-400"
            title={meeting.topic}
            actions={<StatusBadge status="completed" />}
            footer={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-gray-500">
                  참가자: {meeting.participants || 0}명
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-500 hover:text-gray-900"
                  aria-label="수업 상세 보기"
                >
                  상세 보기
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            }
          >
            <div className="p-4 space-y-3">
              <DurationDisplay 
                startTime={meeting.start_time} 
                endTime={meeting.end_time}
              />
            </div>
          </Widget>
        ))}
      </div>
    );
  };

  // 메인 렌더링
  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
          <div className="md:col-span-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">수업 모니터링</h1>
            <p className="text-gray-600 mb-4">실시간 수업 현황과 예정된 수업을 모니터링합니다.</p>
            
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  type="text"
                  placeholder="수업명 또는 강의명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center h-full">
              <div className="w-full border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">업데이트 상태</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {isLoading ? (
                    <span>데이터 로딩 중...</span>
                  ) : (
                    <span>마지막 업데이트: {format(new Date(), 'HH:mm:ss', { locale: ko })}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 통계 섹션 */}
      {renderStats()}
      
      {/* 탭 섹션 */}
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full p-1 bg-gray-100 rounded-xl">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            aria-controls="active-meetings"
          >
            <Video className="h-4 w-4" />
            <span>진행 중인 수업</span>
            {data?.data?.live_meetings?.count && (
              <Badge className="ml-2 bg-emerald-500 text-white">
                {String(data?.data?.live_meetings?.count)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            aria-controls="upcoming-meetings"
          >
            <Calendar className="h-4 w-4" />
            <span>예정된 수업</span>
            {data?.data?.upcoming_meetings?.count && (
              <Badge className="ml-2 bg-blue-500 text-white">
                {String(data?.data?.upcoming_meetings?.count)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            aria-controls="recent-meetings"
          >
            <Clock className="h-4 w-4" />
            <span>최근 종료된 수업</span>
            {data?.data?.recent_past_meetings?.count && (
              <Badge className="ml-2 bg-gray-500 text-white">
                {String(data?.data?.recent_past_meetings?.count)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-6">
          <TabsContent 
            value="active" 
            className="space-y-6 focus:outline-none"
            tabIndex={0}
            role="tabpanel"
            id="active-meetings"
            aria-labelledby="active-tab"
          >
            {renderActiveMeetings()}
          </TabsContent>

          <TabsContent 
            value="upcoming" 
            className="space-y-6 focus:outline-none"
            tabIndex={0}
            role="tabpanel"
            id="upcoming-meetings"
            aria-labelledby="upcoming-tab"
          >
            {renderUpcomingMeetings()}
          </TabsContent>

          <TabsContent 
            value="recent" 
            className="space-y-6 focus:outline-none"
            tabIndex={0}
            role="tabpanel"
            id="recent-meetings"
            aria-labelledby="recent-tab"
          >
            {renderRecentMeetings()}
          </TabsContent>
        </div>
      </Tabs>
      
      {/* 접근성 지원을 위한 CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .animate-fadeIn, .animate-spin {
              animation: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default MonitoringPage; 