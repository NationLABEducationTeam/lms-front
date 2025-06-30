import { FC, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'aws-amplify/auth';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, CreditCard, History, Settings, LogOut, ChevronDown, Briefcase, BookOpen, Code, Heart, ShoppingCart } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const RootLayout: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isVideoPlayerPage = location.pathname.includes('/video/');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsAtTop(scrollTop === 0);
    };

    if (isMainPage) {
      setIsAtTop(window.scrollY === 0);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsAtTop(false);
    }
  }, [isMainPage]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      navigate('/auth');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (isVideoPlayerPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* 상단 네비게이션 */}
      <nav 
        className={cn(
          "fixed top-0 left-0 w-full bg-white/95 shadow-sm backdrop-blur z-50 transition-all duration-300"
        )}
      >
        {/* 미니 헤더 */}
        <div className="h-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-end items-center h-full space-x-6">
              <button 
                onClick={() => navigate('/corporate')}
                className={cn(
                  "text-sm flex items-center gap-1.5 transition-colors",
                  isMainPage && isAtTop 
                    ? "text-slate-700 hover:text-slate-900" 
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                기업교육
              </button>
              <div className={cn(
                "h-3 w-px",
                isMainPage && isAtTop ? "bg-slate-300" : "bg-gray-300"
              )} />
              <button 
                onClick={() => navigate('/deepcoding')}
                className={cn(
                  "text-sm flex items-center gap-1.5 transition-colors",
                  isMainPage && isAtTop 
                    ? "text-slate-700 hover:text-slate-900" 
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                딥코딩테스트
              </button>
              <div className={cn(
                "h-3 w-px",
                isMainPage && isAtTop ? "bg-slate-300" : "bg-gray-300"
              )} />
              <a 
                href="https://blog.nationslab.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "text-sm flex items-center gap-1.5 transition-colors",
                  isMainPage && isAtTop 
                    ? "text-slate-700 hover:text-slate-900" 
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                기술블로그
              </a>
            </div>
          </div>
        </div>

        {/* 메인 네비게이션 */}
        <div className="h-[88px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              {/* 로고 */}
              <div 
                onClick={() => navigate('/')}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img 
                  src="/long-logo.png"
                  alt="Nations LAB LMS" 
                  className="h-10 w-auto transition-all duration-300"
                />
              </div>

              {/* 네비게이션 링크 */}
              <div className="hidden md:flex items-center gap-8">
                {[
                  { path: '/dashboard', label: '대시보드' },
                  // { path: '/pending-courses', label: '결제 대기 과목' },
                  { path: '/community', label: '커뮤니티' }
                ].map(({ path, label }) => (
                  <button 
                    key={path}
                    onClick={() => user ? navigate(path) : navigate('/auth')}
                    className={cn(
                      "font-medium transition-colors",
                      "text-gray-700 hover:text-gray-900"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 사용자 메뉴 */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className={cn(
                        "transition-colors",
                        isMainPage && isAtTop 
                          ? "text-slate-700 hover:text-slate-900 hover:bg-white/10" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <User className="w-5 h-5 mr-2" />
                      <span>{user.given_name}님</span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className={cn(
                      "w-56 rounded-lg shadow-lg border",
                      isMainPage && isAtTop 
                        ? "bg-white border-slate-200" 
                        : "bg-white border-gray-200"
                    )}
                  >
                    <DropdownMenuLabel className="text-gray-900">
                      내 계정
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuGroup>
                      {[
                        { path: '/my-courses', label: '내 강의 보기', icon: User },
                        { path: '/student/wishlist', label: '관심 목록', icon: Heart },
                        { path: '/student/cart', label: '장바구니', icon: ShoppingCart },
                        { path: '/pending-courses', label: '결제 대기 강의', icon: CreditCard },
                        { path: '/transactions', label: '거래 내역', icon: History },
                        { path: '/settings', label: '설정', icon: Settings }
                      ].map(({ path, label, icon: Icon }) => (
                        <DropdownMenuItem
                          key={path}
                          onClick={() => navigate(path)}
                          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-500 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className={cn(
                    "px-6 transition-colors",
                    isMainPage && isAtTop 
                      ? "bg-slate-700 text-white hover:bg-slate-800" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  size="lg"
                >
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className={cn(
        "flex-1",
        !isMainPage && "pt-[96px]" // 네비게이션 바 높이(88px + 8px)만큼 패딩 추가
      )}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout; 