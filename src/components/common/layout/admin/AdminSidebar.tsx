import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Settings,
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
  { icon: Settings, label: '시스템 관리', path: '/admin/system' },
  { icon: BarChart2, label: '통계', path: '/admin/statistics' },
  { icon: Award, label: '수료 관리', path: '/admin/certificates' },
  { icon: Bell, label: '공지사항', path: '/admin/notices' },
  { icon: MessageSquare, label: '게시판 관리', path: '/admin/boards' },
  { icon: Star, label: '강의 후기 관리', path: '/admin/reviews' },
];

const AdminSidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="pt-6 px-4">
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 w-full px-5 py-3 text-sm rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar; 