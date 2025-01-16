import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout; 