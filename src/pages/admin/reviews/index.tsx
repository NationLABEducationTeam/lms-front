import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/ui/card';
import { Plus, BarChart2, Edit, Trash2, MoreVertical, Search, Clock, Users, FolderOpen, Link2, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/common/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from '@/components/common/ui/alert-dialog';
import { useGetReviewTemplatesQuery, useDeleteReviewTemplateMutation, ReviewTemplate } from '@/services/api/reviewApi';
import { toast } from 'sonner';

interface TransformedReview {
  id: string;
  title: string;
  subtitle: string;
  targetRespondents?: number;
  createdAt: string;
}

const AdminReviewsPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);
  const [failedDeleteReviewId, setFailedDeleteReviewId] = useState<string | null>(null);
  
  const { data: reviewTemplates, isLoading, error, refetch } = useGetReviewTemplatesQuery();
  const [deleteReviewTemplate, { isLoading: isDeleting }] = useDeleteReviewTemplateMutation();

  const reviews: TransformedReview[] = useMemo(() => {
    if (!reviewTemplates) return [];
    return reviewTemplates.map(template => ({
      id: template.id,
      title: template.title,
      subtitle: template.description || `Course ID: ${template.courseId}`,
      targetRespondents: template.targetRespondents,
      createdAt: template.createdAt,
    }));
  }, [reviewTemplates]);

  const filteredReviews = useMemo(() =>
    reviews.filter(review =>
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    ), [reviews, searchTerm]);

  const handleDelete = async (reviewId: string) => {
    if (isDeleting) return;
    if (!confirm('정말로 이 설문 템플릿을 삭제하시겠습니까?')) return;
    try {
      await deleteReviewTemplate(reviewId).unwrap();
      toast.success('설문 템플릿이 삭제되었습니다.');
      window.location.reload();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      // 서버에서 "응답이 제출된" 관련 메시지를 받은 경우 전용 다이얼로그 표시
      if (err?.data?.message && err.data.message.includes('응답이 제출된')) {
        setFailedDeleteReviewId(reviewId);
        setShowDeleteErrorDialog(true);
      } else if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error('설문 템플릿 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">후기 관리</h1>
            <p className="mt-1 text-md text-gray-600">생성된 후기 폼 목록 및 관리를 할 수 있습니다.</p>
          </div>
          <Button onClick={() => navigate('/admin/reviews/create')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            새 설문 만들기
          </Button>
        </div>

        {/* 검색 */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="설문 제목 또는 설명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 로딩 및 에러 상태 */}
        {isLoading && (
          <div className="text-center py-20">
            <div role="status" className="flex justify-center items-center space-x-2">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="text-gray-500">설문 목록을 불러오는 중...</span>
            </div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-red-500 font-semibold text-lg">데이터를 불러오는데 실패했습니다.</p>
            <p className="text-gray-500 mt-2">네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-6">
              다시 시도
            </Button>
          </div>
        )}

        {/* 후기 폼 목록 */}
        {!isLoading && !error && (
          <>
            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">{review.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-500 line-clamp-1">{review.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent 
                      className="flex-grow space-y-3 text-sm cursor-pointer"
                      onClick={() => window.open(`/reviews/${review.id}`, '_blank')}
                    >
                      <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>목표 응답자</span>
                        </div>
                        <span className="font-semibold">{review.targetRespondents || 'N/A'} 명</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>생성일</span>
                        </div>
                        <span className="font-semibold">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch space-y-2 pt-4">
                      <Button 
                        className="w-full bg-blue-600 text-white hover:bg-blue-700" 
                        onClick={() => navigate(`/admin/reviews/${review.id}/results`)}
                      >
                        <BarChart2 className="w-4 h-4 mr-2" />
                        결과 보기
                      </Button>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <MoreVertical className="w-4 h-4 mr-1" />
                              더보기
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                const url = `${window.location.origin}/reviews/${review.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success("설문 링크가 복사되었습니다!");
                            }}>
                              <Link2 className="w-4 h-4 mr-2" />
                              공유 링크 복사
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/reviews/${review.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(review.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isDeleting ? '삭제 중...' : '삭제하기'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">생성된 설문 없음</h3>
                  <p className="mt-1 text-sm text-gray-500">아직 생성된 설문이 없습니다. 첫 설문을 만들어보세요.</p>
                  <div className="mt-6">
                    <Button onClick={() => navigate('/admin/reviews/create')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      새 설문 만들기
                    </Button>
                  </div>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showDeleteErrorDialog} onOpenChange={setShowDeleteErrorDialog}>
        <AlertDialogOverlay />
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">삭제할 수 없습니다</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="py-4">
            이미 응답이 제출된 설문 템플릿은 삭제할 수 없습니다.
            <br />
            데이터 보존을 위해, 먼저 응답 결과를 확인하거나 백업해주세요.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFailedDeleteReviewId(null)}>닫기</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (failedDeleteReviewId) {
                  navigate(`/admin/reviews/${failedDeleteReviewId}/results`);
                }
                setFailedDeleteReviewId(null);
              }}
            >
              결과 보기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviewsPage;
