import React from 'react';
import { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/common/ui/card/index';
import DataTable from '@/components/common/ui/DataTable';
import type { Column } from '@/components/common/ui/DataTable';
import { FileUpload } from '@/components/common/upload/FileUpload';
import { getStudents } from '@/services/api/users';
import type { DBUser } from '@/types/user';

const InstructorDashboard: React.FC = () => {
  const [students, setStudents] = useState<DBUser[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentData = await getStudents();
        setStudents(studentData);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('학생 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const columns: Column<DBUser>[] = [
    { header: '이름', accessor: 'given_name' },
    { header: '이메일', accessor: 'email' },
    { header: '가입일', accessor: 'created_at' },
    { 
      header: '최근 접속일', 
      accessor: (user: DBUser) => user.updated_at || '-'
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">강사 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>총 수강생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.length}명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>강의 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload 
              onUpload={(files) => console.log('Uploaded:', files)}
              accept="video/*"
              maxFiles={1}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <p>최근 업로드한 강의가 없습니다.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>수강생 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;