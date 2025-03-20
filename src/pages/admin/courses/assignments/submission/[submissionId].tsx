import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { Calendar, Clock, FileText, Award, CheckCircle, AlertTriangle, X, Download, Upload, User, Book } from 'lucide-react';
import { adminApi } from '@/services/api/adminApi';

// Skeleton 컴포넌트 정의
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// 날짜 포맷 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return '없음';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 파일 크기 포맷 함수
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일 아이콘 가져오기 함수
const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return <FileText className="h-5 w-5 text-gray-500" />;
  
  if (fileType.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (fileType.includes('image')) {
    return <FileText className="h-5 w-5 text-green-500" />;
  } else if (fileType.includes('zip') || fileType.includes('rar')) {
    return <FileText className="h-5 w-5 text-yellow-500" />;
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  } else if (fileType.includes('text') || fileType.includes('code')) {
    return <FileText className="h-5 w-5 text-gray-500" />;
  } else {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
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

// API 파일 객체 인터페이스
interface ApiFile {
  name: string;
  size: number;
  type: string;
  key: string;
}

// 제출물 상세 페이지 컴포넌트
const SubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 상태 관리
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // API 호출
  const { 
    data: submissionData, 
    isLoading, 
    error
  } = adminApi.useGetSubmissionDetailQuery(submissionId || '');
  
  // API 응답을 인터페이스에 맞게 변환
  const submission = useMemo(() => {
    if (!submissionData) return null;
    
    // API 응답의 파일 객체를 인터페이스에 맞게 변환
    const transformedFiles = (submissionData as any).files?.map((file: any) => ({
      fileName: file.name || '',
      fileSize: file.size || 0,
      fileType: file.type || '',
      fileKey: file.key || '',
      uploadDate: new Date().toISOString() // API에 없는 경우 현재 시간 사용
    })) || [];
    
    return {
      ...(submissionData as any),
      files: transformedFiles
    };
  }, [submissionData]);
  
  const [gradeSubmission, { isLoading: isGrading }] = adminApi.useGradeSubmissionMutation();
  
  // 제출물 데이터 로드 시 점수와 피드백 초기화
  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? 0);
      setFeedback(submission.feedback ?? '');
    }
  }, [submission]);
  
  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        setCurrentUserId(userAttributes.sub || '');
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };
    
    getUserInfo();
  }, []);
  
  // 채점 제출 핸들러
  const handleSubmitGrade = async () => {
    if (!submissionId || !currentUserId) return;
    
    try {
      setIsSubmitting(true);
      await gradeSubmission({
        submissionId,
        data: {
          score,
          feedback,
          modified_by: currentUserId
        }
      }).unwrap();
      
      // 성공 메시지 또는 로직
    } catch (error) {
      console.error('채점 오류:', error);
      // 오류 메시지 또는 로직
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 파일 다운로드 핸들러
  const handleDownloadFile = async (fileKey: string, fileName: string) => {
    try {
      // 로딩 상태 표시
      toast.loading('파일 다운로드 준비 중...');
      
      // 인증 세션 가져오기
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }
      
      // API 요청으로 다운로드 URL 받아오기 (인증 헤더 포함)
      const response = await axios.get(getApiUrl(`/admin/assignments/file/${fileKey}/download-url`), {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      
      // 응답 데이터 구조 확인
      console.log('파일 다운로드 URL 응답:', response.data);
      
      // 응답 구조가 { success: true, data: { downloadUrl: "URL" } } 형태인지 확인
      if (response.data?.success && response.data?.data?.downloadUrl) {
        // 로딩 토스트 숨김
        toast.dismiss();
        
        // 다운로드 URL을 사용하여 파일 다운로드
        const downloadUrl = response.data.data.downloadUrl;
        
        // 새 창에서 URL 열기 (파일 다운로드 시작)
        window.open(downloadUrl, '_blank');
        
        toast.success('파일 다운로드가 시작되었습니다.');
      } else {
        throw new Error('다운로드 URL을 받아오지 못했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast.error('파일 다운로드 중 오류가 발생했습니다.');
    }
  };
  
  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // 에러 UI
  if (error || !submission) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          제출물 상세 정보를 불러오는데 실패했습니다.
        </p>
        <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {submission.assignment_name} - 제출물 상세
          </h1>
          <p className="text-muted-foreground mt-1">
            {submission.course_title} | 학생: {submission.student_name} ({submission.student_email})
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/courses/assignments/submissions/${submission.item_id}`)}>
          제출 목록으로 돌아가기
        </Button>
      </div>
      
      {/* 탭 UI */}
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">제출물 상세</TabsTrigger>
          <TabsTrigger value="grade">채점 및 피드백</TabsTrigger>
        </TabsList>
        
        {/* 제출물 상세 탭 */}
        <TabsContent value="details" className="space-y-4">
          {/* 제출 정보 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">학생 및 과제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">학생 정보</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.student_name} ({submission.student_email})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Book className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">과제 정보</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.assignment_name} | {submission.item_type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">마감일</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(submission.due_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">제출 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getSubmissionStatusBadge(submission)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {submission.is_late 
                      ? '마감일 이후에 제출되었습니다.' 
                      : submission.has_submitted
                        ? '마감일 전에 제출되었습니다.'
                        : '제출되지 않았습니다.'}
                  </p>
                </div>
                
                {submission.has_submitted && (
                  <>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">제출 시간</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(submission.submission_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Award className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">점수</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.score !== null 
                            ? `${submission.score}점` 
                            : '채점 전'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* 학생 제출 내용 */}
          {submission.has_submitted && (
            <Card>
              <CardHeader>
                <CardTitle>제출 내용</CardTitle>
                <CardDescription>
                  학생이 작성한 코멘트와 제출한 파일입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 코멘트 */}
                {submission.submission_data?.comment && (
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">코멘트</h3>
                    <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {submission.submission_data.comment}
                    </div>
                  </div>
                )}
                
                {/* 제출 파일 목록 */}
                <div className="space-y-2">
                  <h3 className="text-md font-medium">제출 파일 ({submission.files.length}개)</h3>
                  {submission.files.length === 0 ? (
                    <p className="text-muted-foreground">제출된 파일이 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {submission.files.map((file: {
                        fileName: string;
                        fileSize: number;
                        fileType: string;
                        fileKey: string;
                        uploadDate: string;
                      }, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            {getFileIcon(file.fileType)}
                            <div className="ml-3">
                              <p className="font-medium">{file.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.fileSize)} | {formatDate(file.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleDownloadFile(file.fileKey, file.fileName)}
                          >
                            <Download className="h-4 w-4" />
                            다운로드
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* 피드백 내용 (이미 채점된 경우) */}
          {submission.is_completed && (
            <Card>
              <CardHeader>
                <CardTitle>채점 및 피드백</CardTitle>
                <CardDescription>
                  제공된 점수와 피드백입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-xl font-bold">{submission.score}점</span>
                </div>
                
                {submission.feedback && (
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">피드백</h3>
                    <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {submission.feedback}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* 채점 탭 */}
        <TabsContent value="grade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>채점 및 피드백 작성</CardTitle>
              <CardDescription>
                제출물을 평가하고 점수와 피드백을 제공하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 점수 입력 */}
              <div className="space-y-2">
                <Label htmlFor="score">점수 (0-100)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/ 100</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 피드백 입력 */}
              <div className="space-y-2">
                <Label htmlFor="feedback">피드백</Label>
                <Textarea
                  id="feedback"
                  placeholder="학생에게 제공할 피드백을 작성하세요..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('details')}>
                취소
              </Button>
              <Button 
                onClick={handleSubmitGrade} 
                disabled={isSubmitting || isGrading}
              >
                {isSubmitting || isGrading ? '처리 중...' : '채점 완료'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionDetailPage; 