import { FC, useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
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

// 임시 데이터
const certificationsData = [
  {
    id: 1,
    studentName: '김철수',
    courseName: 'AWS 클라우드 아키텍처',
    progress: 100,
    startDate: '2024-01-15',
    completionDate: '2024-03-15',
    status: 'completed',
  },
  {
    id: 2,
    studentName: '이영희',
    courseName: 'DevOps 마스터 과정',
    progress: 85,
    startDate: '2024-02-01',
    completionDate: null,
    status: 'in_progress',
  },
  // ... 더미 데이터
];

const AdminCertifications: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCertifications = certificationsData.filter(cert => {
    const matchesSearch = 
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            수료 완료
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            진행중
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            미수료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">수료 관리</h1>
          <p className="text-gray-600 mt-1">수강생들의 강의 수료 현황을 관리합니다.</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="학생 또는 강의명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px] bg-white border-gray-200">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="completed">수료 완료</SelectItem>
                  <SelectItem value="in_progress">진행중</SelectItem>
                  <SelectItem value="failed">미수료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-100">
              <Download className="w-4 h-4 mr-2" />
              수료 현황 내보내기
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600">학생명</TableHead>
                  <TableHead className="text-gray-600">강의명</TableHead>
                  <TableHead className="text-gray-600">진도율</TableHead>
                  <TableHead className="text-gray-600">시작일</TableHead>
                  <TableHead className="text-gray-600">수료일</TableHead>
                  <TableHead className="text-gray-600">상태</TableHead>
                  <TableHead className="text-gray-600">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow key={cert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {cert.studentName}
                    </TableCell>
                    <TableCell className="text-gray-600">{cert.courseName}</TableCell>
                    <TableCell className="text-gray-600">{cert.progress}%</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(cert.startDate).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {cert.completionDate 
                        ? new Date(cert.completionDate).toLocaleDateString('ko-KR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => {}}
                      >
                        상세보기
                      </Button>
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

export default AdminCertifications; 