import { FC, useState } from 'react';
import { Search, Download, Eye, Plus } from 'lucide-react';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Badge } from '@/components/common/ui/badge';

// 나중에 API 응답에 맞춰 수정될 수 있는 수료증 타입
interface Certificate {
  id: number;
  studentName: string;
  courseName: string;
  completionDate: string;
  grade: string;
  status: 'issued' | 'pending';
}

const AdminCertificates: FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // useEffect(() => {
  //   // 나중에 API를 호출하여 데이터를 가져옵니다.
  //   // 예: getCertificates().then(setCertificates);
  // }, []);

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">수료증 관리</h1>
          <p className="text-gray-600 mt-1">수강생들의 수료증을 관리하고 발급합니다.</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="이름 또는 강의로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="issued">발급완료</SelectItem>
                  <SelectItem value="pending">발급대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    일괄 다운로드
                </Button>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    수료증 발급
                </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>수강생</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>수료일</TableHead>
                  <TableHead>성적</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.length > 0 ? (
                  filteredCertificates.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {cert.studentName}
                      </TableCell>
                      <TableCell>{cert.courseName}</TableCell>
                      <TableCell>
                        {new Date(cert.completionDate).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>{cert.grade}</TableCell>
                      <TableCell>
                        <Badge variant={cert.status === 'issued' ? 'default' : 'secondary'}>
                          {cert.status === 'issued' ? '발급완료' : '발급대기'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                      발급된 수료증이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificates;