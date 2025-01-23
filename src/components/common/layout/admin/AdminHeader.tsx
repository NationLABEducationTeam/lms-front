import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';

const AdminHeader: FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      navigate('/auth');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-8 justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/admin')}
        >
          <div className="font-bold text-xl text-blue-600">NationsLab</div>
          <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded">
            ADMIN
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 