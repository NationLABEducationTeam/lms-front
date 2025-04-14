import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getList, removeFromCart, updateCartQuantity, clearCart } from '@/services/api/courseInteractions';
import { Trash2, Loader2, Minus, Plus, ShoppingCart, RefreshCcw, BookOpen, CreditCard, Heart } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 장바구니에 있는 과목 데이터 타입
interface CartItemData {
  id: string;
  title: string;
  price?: number;
  quantity?: number;
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.cognito_user_id) return;
      
      try {
        setLoading(true);
        console.log("장바구니 불러오기 시작, 사용자 ID:", user.cognito_user_id);
        const response = await getList(user.cognito_user_id, 'CART');
        console.log("장바구니 데이터:", response);
        
        if (response.success && response.data) {
          // CourseItem[] 타입에서 CartItemData[] 타입으로 변환
          const items = response.data.map(item => ({
            ...item.courseData,
            quantity: item.quantity || 1
          }));
          setCartItems(items);
        } else {
          setCartItems([]);
          if (!response.success) {
            toast('장바구니 불러오기 실패', {
              description: '장바구니를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        toast('장바구니 불러오기 실패', {
          description: '장바구니를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user?.cognito_user_id) {
        fetchCart();
      } else if (user === null) {
        // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
        navigate('/auth?redirect=/student/cart');
      }
    }
  }, [user, authLoading, navigate]);

  const handleRemoveFromCart = async (courseId: string, courseTitle: string) => {
    if (!user?.cognito_user_id) return;
    
    try {
      setActionLoading(courseId);
      console.log("장바구니에서 제거 시작, 사용자 ID:", user.cognito_user_id, "과목 ID:", courseId);
      await removeFromCart(user.cognito_user_id, courseId);
      setCartItems(cartItems.filter(item => item.id !== courseId));
      toast('장바구니에서 제거됨', {
        description: `${courseTitle}이(가) 장바구니에서 제거되었습니다.`
      });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast('작업 실패', {
        description: '장바구니에서 제거하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateQuantity = async (courseId: string, currentQuantity: number, increment: boolean) => {
    if (!user?.cognito_user_id) return;
    
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    
    // 변경이 없으면 아무것도 하지 않음
    if (newQuantity === currentQuantity) return;
    
    try {
      setActionLoading(courseId);
      console.log("수량 변경 시작, 사용자 ID:", user.cognito_user_id, "과목 ID:", courseId, "새 수량:", newQuantity);
      await updateCartQuantity(user.cognito_user_id, courseId, newQuantity);
      
      // 상태 업데이트
      setCartItems(cartItems.map(item => 
        item.id === courseId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast('수량 변경 실패', {
        description: '수량을 변경하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCart = async () => {
    if (!user?.cognito_user_id || !window.confirm('정말 장바구니를 비우시겠습니까?')) return;
    
    try {
      setClearingCart(true);
      console.log("장바구니 비우기 시작, 사용자 ID:", user.cognito_user_id);
      await clearCart(user.cognito_user_id);
      setCartItems([]);
      toast('장바구니 비움', {
        description: '장바구니가 성공적으로 비워졌습니다.'
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast('장바구니 비우기 실패', {
        description: '장바구니를 비우는 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setClearingCart(false);
    }
  };

  // 총 가격 계산
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
          <p className="text-gray-500 mt-2">
            결제 대기 중인 강의 목록
          </p>
        </div>
        
        <div className="flex gap-3">
          {cartItems.length > 0 && (
            <Button 
              variant="outline"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
            >
              {clearingCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              장바구니 비우기
            </Button>
          )}
          
          <Link to="/pending-courses">
            <Button variant="default" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              결제 대기 과목
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">장바구니를 불러오는 중...</span>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-blue-50 rounded-full">
                <ShoppingCart className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">장바구니가 비어있습니다</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              과목을 탐색하고 장바구니에 추가해보세요. 
              관심목록에 추가한 과목이 있다면 확인해보세요.
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
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/4 space-y-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      장바구니 항목 ({cartItems.length})
                    </h3>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((course, index) => {
                    // 색상 배열 (5개 색상 순환)
                    const colors = [
                      'bg-blue-50 text-blue-600',
                      'bg-purple-50 text-purple-600',
                      'bg-emerald-50 text-emerald-600',
                      'bg-amber-50 text-amber-600',
                      'bg-pink-50 text-pink-600'
                    ];
                    
                    // 인덱스에 따라 색상 선택 (순환)
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={course.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-5">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClass}`}>
                              <span className="text-lg font-bold">{index + 1}</span>
                            </div>
                            
                            <div>
                              <Link to={`/courses/${course.id}`}>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                                  {course.title}
                                </h3>
                              </Link>
                              
                              <div className="flex items-center mt-2">
                                <div className="flex border border-gray-200 rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-8 w-8 rounded-r-none",
                                      (course.quantity || 1) <= 1 && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => handleUpdateQuantity(course.id, course.quantity || 1, false)}
                                    disabled={actionLoading === course.id || (course.quantity || 1) <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  
                                  <div className="h-8 px-3 flex items-center justify-center border-l border-r border-gray-200 bg-white">
                                    {actionLoading === course.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <span className="text-sm font-medium">{course.quantity || 1}</span>
                                    )}
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-l-none"
                                    onClick={() => handleUpdateQuantity(course.id, course.quantity || 1, true)}
                                    disabled={actionLoading === course.id}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <button
                                  onClick={() => handleRemoveFromCart(course.id, course.title)}
                                  disabled={actionLoading === course.id}
                                  className="ml-4 text-red-500 hover:text-red-600 text-sm font-medium flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  삭제
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {course.price ? `${Number(course.price).toLocaleString()}원` : '무료'}
                            </div>
                            {course.quantity && course.price && course.quantity > 1 && (
                              <div className="text-sm text-gray-500 mt-1">
                                {Number(course.price).toLocaleString()}원 x {course.quantity}개
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-24">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">주문 요약</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-700">
                    <span>상품 수량</span>
                    <span className="font-medium">{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}개</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>총 과목 수</span>
                    <span className="font-medium">{cartItems.length}개</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">총 금액</span>
                      <span className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" size="lg">
                    결제하기
                  </Button>
                  
                  <div className="pt-4 text-center">
                    <div className="flex justify-center space-x-4 text-sm">
                      <Link to="/courses" className="text-blue-600 hover:underline flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        계속 쇼핑하기
                      </Link>
                      <Link to="/student/wishlist" className="text-blue-600 hover:underline flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        관심목록
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 