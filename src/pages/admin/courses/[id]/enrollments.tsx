import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseEnrollmentItem, getCourseEnrollments, updateEnrollmentStatus } from '@/services/api/enrollments';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/common/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/common/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import { Label } from '@/components/common/ui/label';
import { Textarea } from '@/components/common/ui/textarea';
import { Badge } from '@/components/common/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowLeft, 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Clock,
  User,
  Mail,
  Calendar
} from 'lucide-react';

// 상태에 따른 배지 컴포넌트
const EnrollmentStatusBadge: FC<{ status: string }> = ({ status }) => {
  if (status === 'ACTIVE') {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-medium">
        활성
      </Badge>
    );
  } else if (status === 'DROPPED') {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 font-medium">
        정지
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">
      {status}
    </Badge>
  );
};

// 진행 상태에 따른 배지 컴포넌트
const ProgressStatusBadge: FC<{ status: string | null }> = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    'NOT_STARTED': {
      label: '시작 전',
      className: 'bg-amber-100 text-amber-700 border-amber-200 font-medium'
    },
    'IN_PROGRESS': {
      label: '진행 중',
      className: 'bg-blue-100 text-blue-700 border-blue-200 font-medium'
    },
    'COMPLETED': {
      label: '완료',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium'
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

const CourseEnrollmentsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<string>('all');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollmentItem | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // 데이터 가져오기
  const fetchData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getCourseEnrollments(id);
      
      if (response.success) {
        setEnrollments(response.data.enrollments);
        setFilteredEnrollments(response.data.enrollments);
        
        // 강의 제목 설정 (첫 번째 항목에서 가져옴)
        if (response.data.enrollments.length > 0) {
          // API 응답에 course_title이 포함되어 있다면 추출
          // 없다면 course_id를 대신 사용
          setCourseTitle(`${response.data.enrollments[0].course_id}`);
        }
      } else {
        setError('수강생 정보를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('수강생 정보 조회 오류:', error);
      setError(error instanceof Error ? error.message : '수강생 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링 적용
  useEffect(() => {
    let result = [...enrollments];
    
    // 상태 필터링 적용
    if (statusFilter !== 'all') {
      result = result.filter(enrollment => enrollment.status === statusFilter);
    }
    
    // 진행 상태 필터링 적용
    if (progressFilter !== 'all') {
      result = result.filter(enrollment => enrollment.progress_status === progressFilter);
    }
    
    // 검색어 적용 (이름 또는 이메일 기준)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        enrollment => 
          enrollment.student_name.toLowerCase().includes(term) || 
          enrollment.student_email.toLowerCase().includes(term)
      );
    }
    
    setFilteredEnrollments(result);
  }, [enrollments, searchTerm, statusFilter, progressFilter]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [id]);

  // 수강생 상태 변경 처리
  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'DROPPED') => {
    if (!selectedEnrollment) return;
    
    try {
      setUpdating(true);
      const response = await updateEnrollmentStatus(
        selectedEnrollment.id, 
        { 
          status: newStatus, 
          reason: newStatus === 'DROPPED' ? suspendReason : undefined 
        }
      );
      
      if (response.success) {
        // 상태 업데이트 후 목록 갱신
        setEnrollments(prevEnrollments => 
          prevEnrollments.map(item => 
            item.id === selectedEnrollment.id
              ? { ...item, status: newStatus }
              : item
          )
        );
        
        toast.success(
          newStatus === 'DROPPED' 
            ? '수강생 상태가 정지로 변경되었습니다.' 
            : '수강생 상태가 활성화되었습니다.'
        );
        
        // 다이얼로그 닫기 및 상태 초기화
        setSuspendDialogOpen(false);
        setSuspendReason('');
        setSelectedEnrollment(null);
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      toast.error(error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 학생 상세 페이지 이동
  const navigateToStudentDetail = (studentId: string) => {
    navigate(`/admin/students/${studentId}`);
  };

  // 정지 다이얼로그 열기
  const openSuspendDialog = (enrollment: CourseEnrollmentItem) => {
    setSelectedEnrollment(enrollment);
    setSuspendDialogOpen(true);
  };

  // 활성화 처리 (정지 해제)
  const handleActivate = (enrollment: CourseEnrollmentItem) => {
    setSelectedEnrollment(enrollment);
    // 바로 활성화 처리
    handleUpdateStatus('ACTIVE');
  };

  // 데이터 새로고침
  const handleRefresh = () => {
    fetchData();
  };

  // 로딩 스켈레톤
  const renderTableSkeleton = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <div className="h-12 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-10 bg-slate-200 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="border rounded-md">
        <div className="h-10 border-b bg-slate-100"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b last:border-0 pl-4 animate-pulse flex items-center">
            <div className="w-full flex gap-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/6"></div>
              <div className="h-6 bg-slate-200 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-4 mb-8">
          <Button onClick={() => navigate(-1)} variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">수강생 관리</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">에러 발생</span>
          </div>
          <p className="mt-2">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 및 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate(-1)} variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Users className="mr-2 h-5 w-5" />
              수강생 관리
            </h1>
            <p className="text-slate-600 mt-1">
              강의: {courseTitle}
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">필터 및 검색</CardTitle>
          <CardDescription>
            수강생을 이름, 이메일, 상태 또는 진행도로 필터링하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="이름 또는 이메일 검색"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter" className="block text-sm mb-2">
                수강 상태
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="DROPPED">정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="progress-filter" className="block text-sm mb-2">
                진행 상태
              </Label>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger id="progress-filter">
                  <SelectValue placeholder="모든 진행 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 진행 상태</SelectItem>
                  <SelectItem value="NOT_STARTED">시작 전</SelectItem>
                  <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setProgressFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수강생 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              수강생 목록
            </span>
            <Badge variant="outline" className="ml-2">
              {filteredEnrollments.length}명
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            renderTableSkeleton()
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium">수강생이 없습니다</h3>
              <p className="text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'all' || progressFilter !== 'all'
                  ? '검색 조건에 맞는 수강생이 없습니다. 다른 필터를 시도해보세요.'
                  : '이 강의에 등록된 수강생이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">수강생</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>수강 상태</TableHead>
                    <TableHead>진행 상태</TableHead>
                    <TableHead>마지막 접속</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium cursor-pointer hover:text-blue-700" onClick={() => navigateToStudentDetail(enrollment.student_id)}>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 mr-3 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-700" />
                          </div>
                          {enrollment.student_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-slate-600">{enrollment.student_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {enrollment.enrolled_at ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{format(new Date(enrollment.enrolled_at), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell>
                        <ProgressStatusBadge status={enrollment.progress_status} />
                      </TableCell>
                      <TableCell>
                        {enrollment.last_accessed_at ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{format(new Date(enrollment.last_accessed_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {enrollment.status === 'ACTIVE' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => openSuspendDialog(enrollment)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            정지
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleActivate(enrollment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            활성화
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 정지 확인 다이얼로그 */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Ban className="h-5 w-5 mr-2" />
              수강생 정지 확인
            </DialogTitle>
            <DialogDescription className="text-slate-700">
              {selectedEnrollment?.student_name} 학생의 수강을 정지하시겠습니까?
              정지된 학생은 강의에 접근할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>정지 사유를 입력하시면 추후 참고할 수 있습니다. 정지 사유는 필수 항목입니다.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suspend-reason" className="font-medium text-slate-800">
                정지 사유
              </Label>
              <Textarea
                id="suspend-reason"
                placeholder="정지 사유를 입력하세요..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                className="resize-none bg-white text-slate-900 border-slate-300"
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSuspendDialogOpen(false);
                setSuspendReason('');
              }}
              className="bg-white"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateStatus('DROPPED')}
              disabled={!suspendReason.trim() || updating}
            >
              {updating ? '처리 중...' : '정지하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseEnrollmentsPage; 