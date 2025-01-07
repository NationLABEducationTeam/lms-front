import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchSubCategories, fetchCoursesByCategory, clearCourses } from '@/store/features/courses/coursesSlice';
import { getAllUsers } from '@/services/api/users';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/useAuth';
import { CourseList } from '@/components/courses/CourseList';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { Button } from '@/components/common/ui/button';
import { LogOut, Bell, Search } from 'lucide-react';
import { Input } from "@/components/common/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { DBUser } from '@/types/user';

const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categories, subCategories, courses, loading: coursesLoading, error: coursesError } = useSelector((state: RootState) => state.courses);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 검색어에 따른 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTermLower) ||
      user.name.toLowerCase().includes(searchTermLower) ||
      user.given_name?.toLowerCase().includes(searchTermLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    const loadCourses = async () => {
      if (user) {
        try {
          dispatch(clearCourses());
          
          const categoriesResult = await dispatch(fetchCategories()).unwrap();
          console.log('Loaded categories:', categoriesResult);
          
          for (const category of categoriesResult) {
            const subCatsResult = await dispatch(fetchSubCategories(category.path)).unwrap();
            console.log(`Loaded sub categories for ${category.name}:`, subCatsResult);
            
            for (const subCat of subCatsResult) {
              await dispatch(fetchCoursesByCategory({
                mainCategory: category.path,
                subCategory: subCat.name
              })).unwrap();
            }
          }
        } catch (error) {
          console.error('Error loading courses:', error);
        }
      }
    };

    loadCourses();
  }, [dispatch, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const studentCount = filteredUsers.filter(user => user.role === 'STUDENT').length;
  const instructorCount = filteredUsers.filter(user => user.role === 'INSTRUCTOR').length;
  const adminCount = filteredUsers.filter(user => user.role === 'ADMIN').length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-500';
      case 'INSTRUCTOR':
        return 'text-purple-500';
      case 'STUDENT':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleJoinClass = (coursePath: string) => {
    // TODO: 강의실 입장 로직 구현
    console.log('Joining class:', coursePath);
  };

  const handleEditCourse = (course: any) => {
    // TODO: 강의 수정 로직 구현
    console.log('Editing course:', course);
  };

  const handleDeleteCourse = (course: any) => {
    // TODO: 강의 삭제 로직 구현
    console.log('Deleting course:', course);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">관리자 대시보드</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/notices')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Bell className="w-4 h-4" />
              공지사항 관리
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">총 강의 수</h2>
            <p className="text-3xl sm:text-4xl font-bold text-blue-300">{courses.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">총 학생 수</h2>
            <p className="text-3xl sm:text-4xl font-bold text-green-300">{studentCount}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">총 강사 수</h2>
            <p className="text-3xl sm:text-4xl font-bold text-purple-300">{instructorCount}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">총 관리자 수</h2>
            <p className="text-3xl sm:text-4xl font-bold text-red-300">{adminCount}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">사용자 관리</h2>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="이름 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">이름</TableHead>
                      <TableHead className="text-white">이메일</TableHead>
                      <TableHead className="text-white">역할</TableHead>
                      <TableHead className="text-white">가입일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.cognito_user_id}>
                        <TableCell className="text-white">{user.given_name || user.name}</TableCell>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className={getRoleColor(user.role)}>
                          {user.role === 'ADMIN' ? '관리자' : 
                           user.role === 'INSTRUCTOR' ? '강사' : '학생'}
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 mb-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">파일 업로드</h2>
            <FileUpload 
              onUpload={(file) => {
                console.log('File uploaded:', file);
                // TODO: 파일 업로드 처리 로직 구현
              }} 
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">강의 목록</h2>
          {coursesLoading ? (
            <div className="text-center py-4">로딩 중...</div>
          ) : coursesError ? (
            <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg">
              {coursesError}
            </div>
          ) : (
            <CourseList 
              courses={courses} 
              userRole="ADMIN" 
              onJoinClass={handleJoinClass}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 