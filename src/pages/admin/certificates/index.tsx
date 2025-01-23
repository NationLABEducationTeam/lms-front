import { FC, useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
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

const certificatesData = [
  {
    id: 1,
    studentName: '김철수',
    courseName: 'AWS 클라우드 아키텍처',
    completionDate: '2024-03-15',
    grade: 'A',
    status: 'issued',
  },
  {
    id: 2,
    studentName: '이영희',
    courseName: 'DevOps 마스터 과정',
    completionDate: '2024-03-14',
    grade: 'A+',
    status: 'pending',
  },
  // ... 더미 데이터
];

const AdminCertificates: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCertificates = certificatesData.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#232f3e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">수료 관리</h1>
          <p className="text-gray-200 mt-1">수강생들의 수료증을 관리합니다.</p>
        </div>

        <div className="bg-[#1a232e] rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="이름 또는 강의로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#2c3b4e] border-gray-700 text-white placeholder:text-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px] bg-[#2c3b4e] border-gray-700 text-white">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent className="bg-[#2c3b4e] text-white">
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="issued">발급완료</SelectItem>
                  <SelectItem value="pending">발급대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#2c3b4e] hover:bg-[#374a61] text-white">
              <Download className="w-4 h-4 mr-2" />
              수료증 일괄 다운로드
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#2c3b4e] border-gray-700">
                  <TableHead className="text-white">수강생</TableHead>
                  <TableHead className="text-white">강의명</TableHead>
                  <TableHead className="text-white">수료일</TableHead>
                  <TableHead className="text-white">성적</TableHead>
                  <TableHead className="text-white">상태</TableHead>
                  <TableHead className="text-white">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id} className="hover:bg-[#2c3b4e] border-gray-700">
                    <TableCell className="font-medium text-white">
                      {cert.studentName}
                    </TableCell>
                    <TableCell className="text-gray-200">{cert.courseName}</TableCell>
                    <TableCell className="text-gray-200">
                      {new Date(cert.completionDate).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="text-gray-200">{cert.grade}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${cert.status === 'issued' 
                          ? 'bg-green-900 text-green-200'
                          : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {cert.status === 'issued' ? '발급완료' : '발급대기'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificates; 