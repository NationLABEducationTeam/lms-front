import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-full">
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 