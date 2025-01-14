import { FC, ReactNode } from 'react';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout; 