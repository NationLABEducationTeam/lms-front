import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout; 