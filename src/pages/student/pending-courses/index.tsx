import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getList, removeFromCart } from '@/services/api/courseInteractions';
import { Trash2, Loader2, BookOpen, AlertCircle, Clock, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { toast } from 'sonner';

// 과목 데이터 타입
interface PendingCourseData {
  id: string;
  title: string;
  price?: number;
  quantity?: number;
}

export default function PendingCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingCourses, setPendingCourses] = useState<PendingCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingCourses = async () => {
      if (!user?.cognito_user_id) return;
      
      try {
        setLoading(true);
        console.log("장바구니 과목 불러오기 시작, 사용자 ID:", user.cognito_user_id);
        const response = await getList(user.cognito_user_id, 'CART');
        console.log("장바구니 데이터:", response);
        
        if (response.success && response.data) {
          // CourseItem[] 타입에서 PendingCourseData[] 타입으로 변환
          const items = response.data.map(item => ({
            ...item.courseData,
            quantity: item.quantity || 1
          }));
          setPendingCourses(items);
        } else {
          setPendingCourses([]);
          if (!response.success) {
            toast('예정된 과목 불러오기 실패', {
              description: '과목을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending courses:', error);
        toast('예정된 과목 불러오기 실패', {
          description: '과목을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user?.cognito_user_id) {
        fetchPendingCourses();
      } else if (user === null) {
        // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
        navigate('/auth?redirect=/pending-courses');
      }
    }
  }, [user, authLoading, navigate]);

  const handleRemovePendingCourse = async (courseId: string, courseTitle: string) => {
    if (!user?.cognito_user_id) return;
    
    try {
      setActionLoading(courseId);
      console.log("예정된 과목에서 제거 시작, 사용자 ID:", user.cognito_user_id, "과목 ID:", courseId);
      await removeFromCart(user.cognito_user_id, courseId);
      setPendingCourses(pendingCourses.filter(item => item.id !== courseId));
      toast('예정된 과목에서 제거됨', {
        description: `${courseTitle}이(가) 예정된 과목에서 제거되었습니다.`
      });
    } catch (error) {
      console.error('Failed to remove from pending courses:', error);
      toast('작업 실패', {
        description: '과목을 제거하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // 인증 로딩 중일 때 로딩 표시
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">로그인 상태 확인 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">결제 대기 과목</h1>
          <p className="text-gray-500 mt-2">
            결제 후 수강할 수 있는 과목 목록입니다
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link to="/courses">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              과목 찾기
            </Button>
          </Link>
          <Link to="/student/cart">
            <Button variant="default" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              장바구니로 이동
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">예정된 과목을 불러오는 중...</span>
        </div>
      ) : pendingCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-12 text-center">
            <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
              <Clock className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">예정된 과목이 없습니다</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              관심 있는 과목을 탐색하고 장바구니에 추가해 보세요.
              결제 후에는 이곳에서 확인할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/courses">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  과목 탐색하기
                </Button>
              </Link>
              <Link to="/student/wishlist">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  관심목록 확인하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  이 목록은 장바구니에 추가한 과목들입니다. 결제를 완료하면 수강할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {pendingCourses.map((course, index) => {
              // 색상 배열 (5개 색상 순환)
              const colors = [
                'bg-blue-50 text-blue-600 border-blue-200',
                'bg-purple-50 text-purple-600 border-purple-200',
                'bg-emerald-50 text-emerald-600 border-emerald-200',
                'bg-amber-50 text-amber-600 border-amber-200',
                'bg-pink-50 text-pink-600 border-pink-200'
              ];
              
              // 인덱스에 따라 색상 선택 (순환)
              const colorClass = colors[index % colors.length];
              
              return (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-5">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClass}`}>
                          <span className="text-lg font-bold">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <Link to={`/courses/${course.id}`}>
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>결제 대기 중</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          {course.price ? `${Number(course.price).toLocaleString()}원` : '무료'}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleRemovePendingCourse(course.id, course.title)}
                            disabled={actionLoading === course.id}
                            variant="outline" 
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            {actionLoading === course.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                삭제
                              </>
                            )}
                          </Button>
                          
                          <Link to={`/courses/${course.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                              <ArrowRight className="w-4 h-4 mr-1" />
                              세부정보
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">총 {pendingCourses.length}개 과목</p>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {pendingCourses.reduce((sum, course) => sum + (course.price || 0) * (course.quantity || 1), 0).toLocaleString()}원
                </div>
              </div>
              
              <Link to="/student/cart">
                <Button variant="default" size="lg" className="gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  장바구니에서 결제하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 