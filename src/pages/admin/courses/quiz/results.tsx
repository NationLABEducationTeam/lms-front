import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { Button } from '@/components/common/ui/button';
import { Search, Download, ArrowUpDown, BarChart2 } from 'lucide-react';

// 더미 데이터
const DUMMY_RESULTS = [
  {
    id: 1,
    studentName: '김철수',
    studentId: 'ST001',
    score: 85,
    submittedAt: '2024-03-15T14:30:00',
    timeSpent: '45:30',
    status: 'COMPLETED',
    attempts: 1
  },
  {
    id: 2,
    studentName: '이영희',
    studentId: 'ST002',
    score: 92,
    submittedAt: '2024-03-15T15:20:00',
    timeSpent: '38:15',
    status: 'COMPLETED',
    attempts: 1
  },
  {
    id: 3,
    studentName: '박민수',
    studentId: 'ST003',
    score: 78,
    submittedAt: '2024-03-15T14:50:00',
    timeSpent: '50:00',
    status: 'COMPLETED',
    attempts: 2
  },
  {
    id: 4,
    studentName: '정다운',
    studentId: 'ST004',
    score: 95,
    submittedAt: '2024-03-15T14:40:00',
    timeSpent: '42:30',
    status: 'COMPLETED',
    attempts: 1
  },
  {
    id: 5,
    studentName: '한지민',
    studentId: 'ST005',
    score: 65,
    submittedAt: '2024-03-15T15:10:00',
    timeSpent: '60:00',
    status: 'TIMED_OUT',
    attempts: 1
  }
];

const QuizResults: FC = () => {
  const { courseId, quizId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 검색 및 정렬된 결과
  const filteredResults = DUMMY_RESULTS
    .filter(result => 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy as keyof typeof a] > b[sortBy as keyof typeof b] ? 1 : -1) * order;
    });

  // 통계 계산
  const stats = {
    totalStudents: filteredResults.length,
    averageScore: Math.round(filteredResults.reduce((acc, curr) => acc + curr.score, 0) / filteredResults.length),
    highestScore: Math.max(...filteredResults.map(r => r.score)),
    lowestScore: Math.min(...filteredResults.map(r => r.score)),
    completionRate: Math.round((filteredResults.filter(r => r.status === 'COMPLETED').length / filteredResults.length) * 100)
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">퀴즈 결과</h1>
          <p className="text-gray-500">총 {stats.totalStudents}명의 학생이 응시했습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">평균 점수</p>
                <p className="text-2xl font-bold text-blue-700">{stats.averageScore}점</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">최고/최저 점수</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.highestScore}/{stats.lowestScore}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">완료율</p>
                <p className="text-2xl font-bold text-purple-700">{stats.completionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="학생 이름 또는 ID로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: string) => setSortBy(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">점수순</SelectItem>
              <SelectItem value="submittedAt">제출시간순</SelectItem>
              <SelectItem value="timeSpent">소요시간순</SelectItem>
              <SelectItem value="attempts">시도횟수순</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '오름차순' : '내림차순'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>

        {/* 결과 테이블 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">학생</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">점수</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">제출시간</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">소요시간</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">상태</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">시도횟수</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{result.studentName}</div>
                        <div className="text-sm text-gray-500">{result.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                        ${result.score >= 90 ? 'bg-green-100 text-green-800' :
                          result.score >= 80 ? 'bg-blue-100 text-blue-800' :
                          result.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {result.score}점
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {new Date(result.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {result.timeSpent}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${result.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.status === 'COMPLETED' ? '완료' : '시간초과'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {result.attempts}회
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults; 