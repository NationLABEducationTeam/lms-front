import { FC, ReactNode } from 'react';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout min-h-screen bg-gray-50">
      <div className="flex-1 pt-[96px]">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 