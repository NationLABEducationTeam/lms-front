import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';
import { Calendar, Clock, FileText, Award } from 'lucide-react';
import { adminApi } from '@/services/api/adminApi';
import { useGetCourseDetailQuery } from '@/services/api/courseApi';

// Skeleton 컴포넌트 정의
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 과제 타입에 따른 아이콘 가져오기
const getAssignmentTypeIcon = (type: string) => {
  switch (type) {
    case 'ASSIGNMENT':
      return <FileText className="h-4 w-4 mr-1" />;
    case 'EXAM':
      return <Award className="h-4 w-4 mr-1" />;
    case 'QUIZ':
      return <Clock className="h-4 w-4 mr-1" />;
    default:
      return <FileText className="h-4 w-4 mr-1" />;
  }
};

// 과제 타입 한글 변환
const getAssignmentTypeLabel = (type: string) => {
  switch (type) {
    case 'ASSIGNMENT':
      return '과제';
    case 'EXAM':
      return '시험';
    case 'QUIZ':
      return '퀴즈';
    default:
      return '과제';
  }
};

// 과제 목록 페이지 컴포넌트
const CourseAssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // API 호출
  const { data: course, isLoading: courseLoading, error: courseError } = 
    useGetCourseDetailQuery(courseId || '');
    
  const { 
    data: assignments, 
    isLoading: assignmentsLoading, 
    error: assignmentsError
  } = adminApi.useGetCourseAssignmentsQuery(courseId || '');
  
  // 과제 필터링
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    let filtered = [...assignments];
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 타입 필터링
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(assignment => assignment.item_type === typeFilter);
    }
    
    return filtered;
  }, [assignments, searchTerm, typeFilter]);
  
  // 과제 및 시험 개수 계산
  const assignmentCount = useMemo(() => 
    assignments?.filter(a => a.item_type === 'ASSIGNMENT').length || 0,
  [assignments]);
  
  const examCount = useMemo(() => 
    assignments?.filter(a => a.item_type === 'EXAM' || a.item_type === 'QUIZ').length || 0,
  [assignments]);
  
  // 로딩 중 UI
  if (courseLoading || assignmentsLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // 에러 UI
  if (courseError || assignmentsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          {courseError ? '강의 정보를 불러오는데 실패했습니다.' : '과제 목록을 불러오는데 실패했습니다.'}
        </p>
        <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {course?.title || '강의'} - 과제 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            이 강의의 모든 과제 및 시험을 관리하고 학생 제출물을 확인합니다.
          </p>
        </div>
      </div>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">총 과제 수</CardTitle>
            <CardDescription>모든 과제 항목</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              <span className="text-3xl font-bold">{assignmentCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">총 시험/퀴즈 수</CardTitle>
            <CardDescription>모든 시험 및 퀴즈 항목</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-6 w-6 mr-2 text-purple-500" />
              <span className="text-3xl font-bold">{examCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">총 학생 수</CardTitle>
            <CardDescription>등록된 수강생</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-500" />
              <span className="text-3xl font-bold">
                {assignments && assignments.length > 0 
                  ? assignments[0].total_students 
                  : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="과제 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">모든 유형</SelectItem>
              <SelectItem value="ASSIGNMENT">과제</SelectItem>
              <SelectItem value="EXAM">시험</SelectItem>
              <SelectItem value="QUIZ">퀴즈</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Input
            placeholder="과제명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* 과제 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>과제 및 시험 목록</CardTitle>
          <CardDescription>
            모든 과제 및 시험 목록을 확인하고 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">과제가 없습니다</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || typeFilter !== 'ALL' 
                  ? '검색 조건에 맞는 과제가 없습니다. 검색어나 필터를 변경해보세요.'
                  : '이 강의에 등록된 과제나 시험이 없습니다.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>과제명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>마감일</TableHead>
                  <TableHead>제출 현황</TableHead>
                  <TableHead>평균 점수</TableHead>
                  <TableHead>상세 보기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.item_id}>
                    <TableCell className="font-medium">{assignment.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center">
                        {getAssignmentTypeIcon(assignment.item_type)}
                        {getAssignmentTypeLabel(assignment.item_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(assignment.due_date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          {assignment.total_submissions}/{assignment.total_students} 제출
                          ({Math.round((assignment.total_submissions / assignment.total_students) * 100) || 0}%)
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ 
                              width: `${Math.round((assignment.completed_submissions / assignment.total_students) * 100) || 0}%`
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.average_score ? (
                        <div className="font-medium">
                          {typeof assignment.average_score === 'number' 
                            ? `${assignment.average_score.toFixed(1)}점`
                            : `${assignment.average_score}점`
                          }
                          <p className="text-xs text-muted-foreground">
                            최저: {typeof assignment.min_score === 'number' ? assignment.min_score : assignment.min_score}점 | 
                            최고: {typeof assignment.max_score === 'number' ? assignment.max_score : assignment.max_score}점
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">채점 전</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/courses/assignments/submissions/${assignment.item_id}`)}
                      >
                        제출물 확인
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

export default CourseAssignmentsPage; 