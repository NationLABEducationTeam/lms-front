import { FC, useState } from 'react';
import { Search, Plus, Settings, Trash2, Eye } from 'lucide-react';
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

const boardsData = [
  {
    id: 1,
    name: '자유게시판',
    category: 'general',
    postsCount: 150,
    lastPost: '2024-03-15',
    status: 'active',
  },
  {
    id: 2,
    name: '질문과 답변',
    category: 'qna',
    postsCount: 89,
    lastPost: '2024-03-14',
    status: 'active',
  },
  {
    id: 3,
    name: '스터디 모집',
    category: 'study',
    postsCount: 45,
    lastPost: '2024-03-13',
    status: 'inactive',
  },
  // ... 더미 데이터
];

const AdminBoards: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredBoards = boardsData.filter(board => {
    const matchesSearch = 
      board.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || board.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
          <p className="text-gray-600 mt-1">게시판을 생성하고 관리합니다.</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="게시판 이름으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="카테고리 필터" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900">
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="qna">Q&A</SelectItem>
                  <SelectItem value="study">스터디</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-white hover:bg-gray-100 text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              새 게시판 생성
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-gray-200">
                  <TableHead className="text-gray-600">게시판 이름</TableHead>
                  <TableHead className="text-gray-600">카테고리</TableHead>
                  <TableHead className="text-gray-600">게시글 수</TableHead>
                  <TableHead className="text-gray-600">최근 게시글</TableHead>
                  <TableHead className="text-gray-600">상태</TableHead>
                  <TableHead className="text-gray-600">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBoards.map((board) => (
                  <TableRow key={board.id} className="hover:bg-gray-100 border-gray-200">
                    <TableCell className="font-medium text-gray-900">
                      {board.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {board.category === 'general' && '일반'}
                      {board.category === 'qna' && 'Q&A'}
                      {board.category === 'study' && '스터디'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {board.postsCount}개
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(board.lastPost).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${board.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {board.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
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

export default AdminBoards; 