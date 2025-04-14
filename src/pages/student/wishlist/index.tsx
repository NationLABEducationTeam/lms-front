import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getWishlist, CourseData, moveToCart, removeFromWishlist } from '@/services/api/courseInteractions';
import { ShoppingCart, Trash2, Loader2, BookOpen, Heart, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.cognito_user_id) return;
      
      try {
        setLoading(true);
        console.log("위시리스트 불러오기 시작, 사용자 ID:", user.cognito_user_id);
        const items = await getWishlist(user.cognito_user_id);
        console.log("위시리스트 데이터:", items);
        setWishlistItems(items);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        toast('관심 목록 불러오기 실패', {
          description: '관심 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user?.cognito_user_id) {
        fetchWishlist();
      } else if (user === null) {
        // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
        navigate('/auth?redirect=/student/wishlist');
      }
    }
  }, [user, authLoading, navigate]);

  const handleRemoveFromWishlist = async (courseId: string, courseTitle: string) => {
    if (!user?.cognito_user_id) return;
    
    try {
      setActionLoading(courseId);
      console.log("위시리스트에서 제거 시작, 사용자 ID:", user.cognito_user_id, "과목 ID:", courseId);
      await removeFromWishlist(user.cognito_user_id, courseId);
      setWishlistItems(wishlistItems.filter(item => item.id !== courseId));
      toast('관심 목록에서 제거됨', {
        description: `${courseTitle}이(가) 관심 목록에서 제거되었습니다.`
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast('작업 실패', {
        description: '관심 목록에서 제거하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveToCart = async (courseId: string, courseTitle: string) => {
    if (!user?.cognito_user_id) return;
    
    try {
      setActionLoading(courseId);
      console.log("장바구니로 이동 시작, 사용자 ID:", user.cognito_user_id, "과목 ID:", courseId);
      await moveToCart(user.cognito_user_id, courseId);
      setWishlistItems(wishlistItems.filter(item => item.id !== courseId));
      toast('장바구니에 추가됨', {
        description: `${courseTitle}이(가) 장바구니에 추가되었습니다.`
      });
    } catch (error) {
      console.error('Failed to move to cart:', error);
      toast('작업 실패', {
        description: '장바구니에 추가하는 중 오류가 발생했습니다. 다시 시도해주세요.'
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
          <h1 className="text-3xl font-bold text-gray-900">관심 목록</h1>
          <p className="text-gray-500 mt-2">
            나중에 수강할 수 있도록 저장한 과목 목록
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
              장바구니 ({user ? '0' : '0'})
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">관심 목록을 불러오는 중...</span>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-pink-50 rounded-full">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">관심 목록이 비어있습니다</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              관심 있는 과목을 찾아 하트 아이콘을 클릭하면 이곳에 저장됩니다.
              나중에 참고하거나 구매를 결정할 때 도움이 됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/courses">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  과목 탐색하기
                </Button>
              </Link>
              <Link to="/student/cart">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  장바구니 확인하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  관심 목록 ({wishlistItems.length})
                </h3>
                <div className="flex space-x-3">
                  <Link to="/student/cart">
                    <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      장바구니
                    </Button>
                  </Link>
                  <Link to="/pending-courses">
                    <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      결제 대기 과목
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {wishlistItems.map((course, index) => {
              // 색상 배열 (5개 색상 순환)
              const colors = [
                'bg-pink-50 border-pink-100 text-pink-600',
                'bg-purple-50 border-purple-100 text-purple-600',
                'bg-blue-50 border-blue-100 text-blue-600',
                'bg-emerald-50 border-emerald-100 text-emerald-600',
                'bg-amber-50 border-amber-100 text-amber-600'
              ];
              
              // 인덱스에 따라 색상 선택 (순환)
              const colorClass = colors[index % colors.length];
              
              return (
                <div 
                  key={course.id} 
                  className={`rounded-xl shadow-sm overflow-hidden border ${colorClass} hover:shadow-md transition-shadow`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link to={`/courses/${course.id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center mt-3">
                          <Heart className="w-4 h-4 text-pink-500 mr-1.5" />
                          <span className="text-sm text-gray-600">관심 목록에 저장됨</span>
                        </div>
                        
                        <div className="mt-4 flex space-x-3">
                          <Button
                            onClick={() => handleMoveToCart(course.id, course.title)}
                            disabled={actionLoading === course.id}
                            variant="default"
                            size="sm"
                            className="text-sm"
                          >
                            {actionLoading === course.id ? (
                              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-1.5" />
                            )}
                            장바구니에 추가
                          </Button>
                          
                          <Button 
                            onClick={() => handleRemoveFromWishlist(course.id, course.title)}
                            disabled={actionLoading === course.id}
                            variant="outline" 
                            size="sm"
                            className="text-sm text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            관심 목록에서 제거
                          </Button>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end text-right">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          {course.price ? `${Number(course.price).toLocaleString()}원` : '무료'}
                        </div>
                        
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
              );
            })}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6 mt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                관심 있는 과목을 장바구니에 추가하고 결제를 완료하여 수강을 시작하세요.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/courses">
                  <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                    <BookOpen className="w-4 h-4" />
                    계속 과목 탐색하기
                  </Button>
                </Link>
                <Link to="/student/cart">
                  <Button variant="default" className="flex items-center gap-2 w-full sm:w-auto">
                    <ShoppingCart className="w-4 h-4" />
                    장바구니로 이동
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 