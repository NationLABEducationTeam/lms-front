import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { Button } from '../components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import FileUpload from '../components/FileUpload';
import { getAllUsers, type DBUser } from '../lib/dynamodb';

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getAllUsers();
        setUsers(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('사용자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const studentCount = users.filter(user => user.role === 'STUDENT').length;
  const instructorCount = users.filter(user => user.role === 'INSTRUCTOR').length;

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/nationlmslogo.png" alt="NationsLAB LMS" className="h-8 sm:h-10 w-auto" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">관리자 대시보드</h1>
              <p className="text-sm sm:text-base text-blue-300 mt-0.5 sm:mt-1">시스템 전반을 관리할 수 있습니다.</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline"
            className="w-full sm:w-auto bg-white hover:bg-blue-50 text-slate-900 hover:text-blue-600 border-2 transition-colors text-sm sm:text-base h-9 sm:h-10"
          >
            로그아웃
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">사용자 현황</h2>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-blue-300">총 사용자: {users.length}명</p>
              <p className="text-sm sm:text-base text-blue-300">학생: {studentCount}명</p>
              <p className="text-sm sm:text-base text-blue-300">강사: {instructorCount}명</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">강의 관리</h2>
            <p className="text-sm sm:text-base text-blue-300">등록된 강의: 0개</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">시스템 현황</h2>
            <p className="text-sm sm:text-base text-blue-300">모든 시스템이 정상 작동 중입니다.</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">파일 업로드</h2>
          <FileUpload userRole="ADMIN" />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">전체 사용자 목록</h2>
          {error && (
            <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-white text-center py-4">로딩 중...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5">
                    <TableHead className="text-blue-300">이름</TableHead>
                    <TableHead className="text-blue-300">이메일</TableHead>
                    <TableHead className="text-blue-300">역할</TableHead>
                    <TableHead className="text-blue-300">가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-white/5">
                      <TableCell className="text-white">{user.given_name}</TableCell>
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell className="text-white">{user.role}</TableCell>
                      <TableCell className="text-white">{user.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 