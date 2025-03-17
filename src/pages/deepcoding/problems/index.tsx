import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Search, Filter, Clock, BarChart } from 'lucide-react';
import DeepCodingHeader from '@/components/deepcoding/DeepCodingHeader';

// 임시 문제 데이터
const MOCK_PROBLEMS = [
  {
    id: 1,
    title: '두 수의 합',
    difficulty: '쉬움',
    category: '배열',
    solvedCount: 1245,
    acceptanceRate: 75,
  },
  {
    id: 2,
    title: '링크드 리스트 뒤집기',
    difficulty: '중간',
    category: '링크드 리스트',
    solvedCount: 987,
    acceptanceRate: 62,
  },
  {
    id: 3,
    title: '이진 트리 순회',
    difficulty: '중간',
    category: '트리',
    solvedCount: 876,
    acceptanceRate: 58,
  },
  {
    id: 4,
    title: '최단 경로 찾기',
    difficulty: '어려움',
    category: '그래프',
    solvedCount: 543,
    acceptanceRate: 45,
  },
  {
    id: 5,
    title: '문자열 패턴 매칭',
    difficulty: '중간',
    category: '문자열',
    solvedCount: 765,
    acceptanceRate: 60,
  },
  {
    id: 6,
    title: '동적 프로그래밍 기초',
    difficulty: '어려움',
    category: 'DP',
    solvedCount: 432,
    acceptanceRate: 40,
  },
  {
    id: 7,
    title: '힙 구현하기',
    difficulty: '중간',
    category: '힙/우선순위 큐',
    solvedCount: 654,
    acceptanceRate: 55,
  },
  {
    id: 8,
    title: '정렬 알고리즘 구현',
    difficulty: '쉬움',
    category: '정렬',
    solvedCount: 1098,
    acceptanceRate: 70,
  },
];

const ProblemListPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState(MOCK_PROBLEMS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 검색어와 필터에 따라 문제 목록 필터링
  useEffect(() => {
    let filtered = MOCK_PROBLEMS;
    
    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDifficulty) {
      filtered = filtered.filter(problem => problem.difficulty === selectedDifficulty);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(problem => problem.category === selectedCategory);
    }
    
    setFilteredProblems(filtered);
  }, [searchTerm, selectedDifficulty, selectedCategory]);

  // 난이도에 따른 배지 색상
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움':
        return 'bg-green-100 text-green-800';
      case '중간':
        return 'bg-yellow-100 text-yellow-800';
      case '어려움':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 중복 제거된 카테고리 목록
  const categories = Array.from(new Set(MOCK_PROBLEMS.map(p => p.category)));
  
  // 중복 제거된 난이도 목록
  const difficulties = Array.from(new Set(MOCK_PROBLEMS.map(p => p.difficulty)));

  return (
    <div className="min-h-screen bg-gray-50">
      <DeepCodingHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">코딩 문제 목록</h1>
          
          {/* 검색 및 필터 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="문제 검색..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={selectedDifficulty || ''}
                onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              >
                <option value="">난이도</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
              
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty(null);
                  setSelectedCategory(null);
                }}
                className="text-sm"
              >
                초기화
              </Button>
            </div>
          </div>
          
          {/* 문제 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    난이도
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정답률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/deepcoding/problems/${problem.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {problem.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {problem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {problem.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {problem.acceptanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProblems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage; 