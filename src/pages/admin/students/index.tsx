import { FC, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/common/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { getAllUsers } from '@/services/api/users';
import { DBUser } from '@/types/user';

const AdminStudents: FC = () => {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      const students = userData.filter(user => user.role === 'STUDENT');
      setUsers(students);
      setFilteredUsers(students);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('학생 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTermLower) ||
      user.name?.toLowerCase().includes(searchTermLower) ||
      user.given_name?.toLowerCase().includes(searchTermLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">수강생 관리</h1>
            <p className="text-gray-600 mt-1">총 {users.length}명의 수강생</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">수강생 목록</h2>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="이름 또는 이메일로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 bg-red-100 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-gray-200">
                    <TableHead className="text-gray-600">이름</TableHead>
                    <TableHead className="text-gray-600">이메일</TableHead>
                    <TableHead className="text-gray-600">가입일</TableHead>
                    <TableHead className="text-gray-600">수강 중인 강의</TableHead>
                    <TableHead className="text-gray-600">최근 접속일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.cognito_user_id} className="hover:bg-gray-50 border-gray-200">
                      <TableCell className="font-medium text-gray-900">
                        {user.given_name || user.name}
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.enrolled_courses?.length || 0}개
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('ko-KR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents; 