import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { User, CreditCard, History, Settings, LogOut, ChevronDown, Briefcase, BookOpen } from 'lucide-react';

const Header: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        setShowTopBar(true);
      } else if (currentScrollY > lastScrollY) {
        setShowTopBar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowTopBar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      navigate('/auth');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <>
      {/* 헤더 높이만큼 공간 확보 (대시보드 레이아웃이 아닐 때만) */}
      <div className="h-[96px] dashboard-layout:hidden" />
      
      {/* 헤더 컨테이너 */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="transform-gpu">
          {/* 미니 헤더 */}
          <div 
            className={cn(
              "h-8 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 transition-transform duration-300",
              showTopBar ? "transform-none" : "-translate-y-full"
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-end items-center h-full">
                <nav className="flex items-center space-x-6">
                  <button 
                    onClick={() => navigate('/corporate')}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    기업교육
                  </button>
                  <div className="h-3 w-px bg-gray-300" />
                  <a 
                    href="https://blog.nationslab.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    기술블로그
                  </a>
                </nav>
              </div>
            </div>
          </div>

          {/* 메인 헤더 */}
          <div 
            className={cn(
              "h-[88px] bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-transform duration-300",
              showTopBar ? "transform-none" : "-translate-y-8"
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex justify-between items-center h-full">
                {/* 로고 */}
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/')}
                >
                  <img src="/long-logo.png" alt="Nations LAB LMS" className="h-10 w-auto" />
                </div>

                {/* 네비게이션 */}
                <nav className="hidden md:flex items-center gap-8">
                  <button 
                    onClick={() => handleProtectedNavigation('/dashboard')} 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    대시보드
                  </button>
                  <button 
                    onClick={() => handleProtectedNavigation('/courses')} 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    강의실
                  </button>
                  <button 
                    onClick={() => handleProtectedNavigation('/community')} 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    커뮤니티
                  </button>
                </nav>

                {/* 사용자 메뉴 */}
                <div className="flex items-center gap-4">
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="lg" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                          <User className="w-5 h-5 mr-2" />
                          <span className="font-medium">{user.given_name}님</span>
                          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                        <DropdownMenuLabel className="text-gray-700">내 계정</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => navigate('/my-courses')} className="hover:bg-gray-100">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                            <span>내 강의 보기</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/pending-courses')} className="hover:bg-gray-100">
                            <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                            <span>결제 대기 강의</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/transactions')} className="hover:bg-gray-100">
                            <History className="mr-2 h-4 w-4 text-gray-500" />
                            <span>거래 내역</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-gray-100">
                            <Settings className="mr-2 h-4 w-4 text-gray-500" />
                            <span>설정</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem onClick={handleSignOut} className="hover:bg-gray-100 text-red-600 hover:text-red-700">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>로그아웃</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={() => navigate('/auth')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      size="lg"
                    >
                      로그인
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header; 