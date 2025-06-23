import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BarChart2,
  Award,
  Bell,
  MessageSquare,
  Star,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: BookOpen, label: '강의 관리', path: '/admin/courses' },
  { icon: Users, label: '수강생 관리', path: '/admin/students' },
  { icon: Video, label: '수업 모니터링', path: '/admin/monitoring' },
  { icon: BarChart2, label: '통계', path: '/admin/statistics' },
  { icon: Award, label: '수료 관리', path: '/admin/certificates' },
  { icon: Bell, label: '공지사항', path: '/admin/notices' },
  { icon: MessageSquare, label: '커뮤니티', path: '/admin/community' },
  { icon: Users, label: 'Q&A', path: '/admin/qna' },
];

const AdminSidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="flex-1">
        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full py-6 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 px-5">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar; 