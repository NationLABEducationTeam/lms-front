import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'aws-amplify/auth';
import { Button } from '../ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, CreditCard, History, Settings, LogOut, ChevronDown } from 'lucide-react';

const Header: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="w-full px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img src="/long-logo.png" alt="Nations LAB LMS" className="h-8 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleProtectedNavigation('/dashboard')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              대시보드
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/courses')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              강의실
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/assignments')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              과제
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/calendar')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              일정
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/community')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              커뮤니티
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/community')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Blog
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/community')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              기업교육
            </button>
          </nav>

          {/* User Profile or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  {user.given_name}님, 환영합니다
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white rounded-lg shadow-lg border border-gray-200">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 