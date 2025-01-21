import { FC, useState } from 'react';
import { User, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'aws-amplify/auth';

const AdminHeader: FC = () => {
  const auth = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // 다크모드 토글 로직 구현
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex justify-end items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        
        <div className="relative">
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            aria-label="User menu"
          >
            <User className="w-5 h-5" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader; 