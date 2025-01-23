import { FC } from 'react';

const AdminFooter: FC = () => {
  return (
    <footer className="border-t bg-white">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            © 2025 NationsLab. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600">관리자 가이드</a>
            <a href="#" className="hover:text-blue-600">문의하기</a>
            <a href="#" className="hover:text-blue-600">시스템 상태</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter; 