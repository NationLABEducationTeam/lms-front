import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="mt-1 text-sm text-gray-600">
              강의, 학생, 시스템 설정을 관리할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              onClick={() => navigate('/admin/courses/create')}
            >
              <BookOpen className="w-4 h-4" />
              <span>새 강의 생성</span>
            </button>
          </div>
        </div>
        <div className="px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 