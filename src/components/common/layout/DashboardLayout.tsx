import { FC, ReactNode } from 'react';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 