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
import { getAllEnrollments, StudentEnrollment } from '@/services/api/enrollments';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const AdminStudents: FC = () => {
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentEnrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllEnrollments();
      if (response.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setTotalStudents(response.data.total);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = students.filter(student => 
      student.student_email.toLowerCase().includes(searchTermLower) ||
      student.student_name.toLowerCase().includes(searchTermLower)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return 50;
      case 'NOT_STARTED':
        return 0;
      default:
        return 0;
    }
  };

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-100';
      case 'DROPPED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">수강생 관리</h1>
            <p className="text-gray-600 mt-1">총 {totalStudents}명의 수강생</p>
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
              <Accordion type="single" collapsible className="w-full">
                {filteredStudents.map((student) => (
                  <AccordionItem key={student.cognito_user_id} value={student.cognito_user_id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">{student.student_name}</p>
                            <p className="text-sm text-gray-500">{student.student_email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          수강 강의: {student.enrolled_courses.length}개
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 py-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>강의명</TableHead>
                              <TableHead>카테고리</TableHead>
                              <TableHead>상태</TableHead>
                              <TableHead>진도율</TableHead>
                              <TableHead>등록일</TableHead>
                              <TableHead>최근 접속일</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {student.enrolled_courses.map((course) => (
                              <TableRow key={course.course_id}>
                                <TableCell className="font-medium">
                                  {course.course_title}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {course.main_category} &gt; {course.sub_category}
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnrollmentStatusColor(course.enrollment_status)}`}>
                                    {course.enrollment_status === 'ACTIVE' ? '수강중' :
                                     course.enrollment_status === 'COMPLETED' ? '수료' : '중단'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="w-full max-w-xs">
                                    <Progress value={getProgressPercentage(course.progress_status)} className="h-2" />
                                    <span className="text-xs text-gray-500 mt-1">
                                      {getProgressPercentage(course.progress_status)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                  {new Date(course.enrolled_at).toLocaleDateString('ko-KR')}
                                </TableCell>
                                <TableCell className="text-gray-500">
                                  {new Date(course.last_accessed_at).toLocaleDateString('ko-KR')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents; 