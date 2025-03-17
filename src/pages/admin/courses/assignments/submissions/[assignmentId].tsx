import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';
import { Calendar, Clock, FileText, Award, Search, Filter, CheckCircle, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { adminApi } from '@/services/api/adminApi';
import { cn } from "@/lib/utils";

// Skeleton 컴포넌트 정의
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// 날짜 포맷 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return '미제출';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 제출 상태에 따른 배지 렌더링 함수
const getSubmissionStatusBadge = (submission: {
  has_submitted: boolean;
  is_late: boolean;
  is_completed: boolean;
}) => {
  if (!submission.has_submitted) {
    return <Badge variant="destructive" className="flex items-center"><X className="h-3 w-3 mr-1" />미제출</Badge>;
  }
  
  if (submission.is_late) {
    return <Badge variant="outline" className="flex items-center bg-orange-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />지연 제출</Badge>;
  }
  
  if (submission.is_completed) {
    return <Badge variant="outline" className="flex items-center bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />채점 완료</Badge>;
  }
  
  return <Badge variant="secondary" className="flex items-center"><Clock className="h-3 w-3 mr-1" />정상 제출</Badge>;
};

// 제출물 목록 페이지 컴포넌트
const SubmissionsPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<string>('student_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // API 호출
  const { 
    data, 
    isLoading, 
    error
  } = adminApi.useGetAssignmentSubmissionsQuery(assignmentId || '');
  
  // 제출 통계 계산
  const submissionStats = useMemo(() => {
    if (!data) return { total: 0, submitted: 0, late: 0, completed: 0 };
    
    const submissions = data.submissions;
    return {
      total: submissions.length,
      submitted: submissions.filter(s => s.has_submitted).length,
      late: submissions.filter(s => s.is_late).length,
      completed: submissions.filter(s => s.is_completed).length
    };
  }, [data]);
  
  // 제출물 필터링 및 정렬
  const filteredSubmissions = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data.submissions];
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.student_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 상태 필터링
    if (statusFilter !== 'ALL') {
      switch (statusFilter) {
        case 'SUBMITTED':
          filtered = filtered.filter(s => s.has_submitted && !s.is_late);
          break;
        case 'LATE':
          filtered = filtered.filter(s => s.is_late);
          break;
        case 'NOT_SUBMITTED':
          filtered = filtered.filter(s => !s.has_submitted);
          break;
        case 'COMPLETED':
          filtered = filtered.filter(s => s.is_completed);
          break;
      }
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'student_name':
          comparison = a.student_name.localeCompare(b.student_name);
          break;
        case 'submission_date':
          // 미제출자는 항상 맨 아래로
          if (!a.submission_date && !b.submission_date) comparison = 0;
          else if (!a.submission_date) comparison = 1;
          else if (!b.submission_date) comparison = -1;
          else comparison = new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime();
          break;
        case 'score':
          // null 값은 항상 맨 아래로
          if (a.score === null && b.score === null) comparison = 0;
          else if (a.score === null) comparison = 1;
          else if (b.score === null) comparison = -1;
          else comparison = a.score - b.score;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [data, searchTerm, statusFilter, sortField, sortDirection]);
  
  // 정렬 처리 함수
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // 에러 UI
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          제출 현황을 불러오는데 실패했습니다.
        </p>
        <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
      </div>
    );
  }
  
  const { assignment } = data;
  
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment.item_name} - 제출 현황
          </h1>
          <p className="text-muted-foreground mt-1">
            {assignment.course_title} | 마감일: {formatDate(assignment.due_date)}
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/courses/${assignment.course_id}`)}>
          강의로 돌아가기
        </Button>
      </div>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">총 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">{submissionStats.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">제출 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-2xl font-bold">{submissionStats.submitted}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({Math.round((submissionStats.submitted / submissionStats.total) * 100) || 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">지연 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              <span className="text-2xl font-bold">{submissionStats.late}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({Math.round((submissionStats.late / submissionStats.total) * 100) || 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">채점 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
              <span className="text-2xl font-bold">{submissionStats.completed}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({Math.round((submissionStats.completed / submissionStats.total) * 100) || 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <div className="relative">
            <select
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">모든 상태</option>
              <option value="SUBMITTED">정상 제출</option>
              <option value="LATE">지연 제출</option>
              <option value="NOT_SUBMITTED">미제출</option>
              <option value="COMPLETED">채점 완료</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="학생 이름 또는 이메일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>
      
      {/* 제출 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 제출 현황</CardTitle>
          <CardDescription>
            {filteredSubmissions.length}명의 학생 제출 현황을 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">제출 현황이 없습니다</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || statusFilter !== 'ALL' 
                  ? '검색 조건에 맞는 제출 현황이 없습니다. 검색어나 필터를 변경해보세요.'
                  : '이 과제에 대한 제출 현황이 없습니다.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleSort('student_name')}
                  >
                    학생 이름
                    {sortField === 'student_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>제출 상태</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleSort('submission_date')}
                  >
                    제출 시간
                    {sortField === 'submission_date' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleSort('score')}
                  >
                    점수
                    {sortField === 'score' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>파일 수</TableHead>
                  <TableHead>상세 보기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.student_id}>
                    <TableCell className="font-medium">{submission.student_name}</TableCell>
                    <TableCell>{submission.student_email}</TableCell>
                    <TableCell>
                      {getSubmissionStatusBadge(submission)}
                    </TableCell>
                    <TableCell>{formatDate(submission.submission_date)}</TableCell>
                    <TableCell>
                      {submission.score !== null 
                        ? <span className="font-medium">{submission.score}점</span> 
                        : <span className="text-muted-foreground">채점 전</span>
                      }
                    </TableCell>
                    <TableCell>{submission.file_count || 0}개</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={!submission.has_submitted}
                        onClick={() => navigate(`/admin/courses/assignments/submission/${submission.grade_id}`)}
                      >
                        보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionsPage; 