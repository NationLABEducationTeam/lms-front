import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Search, Filter, Clock, BarChart, ArrowUpDown, Check, Lock, Star, AlertTriangle } from 'lucide-react';
import DeepCodingHeader from '@/components/deepcoding/DeepCodingHeader';

// 임시 문제 데이터
const MOCK_PROBLEMS = [
  {
    id: 1001,
    title: '두 수의 합',
    difficulty: '브론즈 1',
    category: '구현',
    tags: ['배열', '해시맵'],
    solvedCount: 1245,
    submissionCount: 1890,
    acceptanceRate: 75,
    status: 'solved',
    isNew: false,
    isPopular: true,
    isHighFailRate: false,
  },
  {
    id: 1002,
    title: '링크드 리스트 뒤집기',
    difficulty: '실버 3',
    category: '자료구조',
    tags: ['연결 리스트', '포인터'],
    solvedCount: 987,
    submissionCount: 1590,
    acceptanceRate: 62,
    status: 'attempted',
    isNew: false,
    isPopular: false,
    isHighFailRate: false,
  },
  {
    id: 1003,
    title: '이진 트리 순회',
    difficulty: '실버 2',
    category: '자료구조',
    tags: ['트리', '재귀'],
    solvedCount: 876,
    submissionCount: 1510,
    acceptanceRate: 58,
    status: 'unsolved',
    isNew: false,
    isPopular: false,
    isHighFailRate: false,
  },
  {
    id: 1004,
    title: '최단 경로 찾기',
    difficulty: '골드 4',
    category: '그래프',
    tags: ['다익스트라', 'BFS'],
    solvedCount: 543,
    submissionCount: 1205,
    acceptanceRate: 45,
    status: 'locked',
    isNew: false,
    isPopular: false,
    isHighFailRate: true,
  },
  {
    id: 1005,
    title: '문자열 패턴 매칭',
    difficulty: '실버 1',
    category: '문자열',
    tags: ['KMP', '라빈-카프'],
    solvedCount: 765,
    submissionCount: 1275,
    acceptanceRate: 60,
    status: 'unsolved',
    isNew: true,
    isPopular: false,
    isHighFailRate: false,
  },
  {
    id: 1006,
    title: '동적 프로그래밍 기초',
    difficulty: '골드 5',
    category: 'DP',
    tags: ['메모이제이션', '최적화'],
    solvedCount: 432,
    submissionCount: 1080,
    acceptanceRate: 40,
    status: 'unsolved',
    isNew: false,
    isPopular: false,
    isHighFailRate: true,
  },
  {
    id: 1007,
    title: '힙 구현하기',
    difficulty: '실버 2',
    category: '자료구조',
    tags: ['힙', '우선순위 큐'],
    solvedCount: 654,
    submissionCount: 1120,
    acceptanceRate: 58,
    status: 'unsolved',
    isNew: false,
    isPopular: false,
    isHighFailRate: false,
  },
  {
    id: 1008,
    title: '팰린드롬 확인하기',
    difficulty: '브론즈 2',
    category: '문자열',
    tags: ['문자열 처리', '투 포인터'],
    solvedCount: 987,
    submissionCount: 1200,
    acceptanceRate: 82,
    status: 'unsolved',
    isNew: true,
    isPopular: true,
    isHighFailRate: false,
  },
  {
    id: 1009,
    title: '정렬 알고리즘 구현',
    difficulty: '브론즈 2',
    category: '정렬',
    tags: ['퀵소트', '병합정렬'],
    solvedCount: 1098,
    submissionCount: 1568,
    acceptanceRate: 70,
    status: 'unsolved',
    isNew: true,
    isPopular: true,
    isHighFailRate: false,
  },
];

// 문제 카테고리 그룹
const PROBLEM_CATEGORIES = [
  { id: 'all', name: '전체 문제' },
  { id: 'implementation', name: '구현' },
  { id: 'datastructure', name: '자료구조' },
  { id: 'graph', name: '그래프' },
  { id: 'string', name: '문자열' },
  { id: 'dp', name: 'DP' },
  { id: 'sorting', name: '정렬' },
  { id: 'math', name: '수학' },
  { id: 'greedy', name: '그리디' },
];

// 문제 필터 그룹
const PROBLEM_FILTERS = [
  { id: 'all', name: '모든 문제', icon: null },
  { id: 'new', name: '새로운 문제', icon: <Star className="w-4 h-4 text-yellow-500" /> },
  { id: 'popular', name: '많이 푼 문제', icon: <BarChart className="w-4 h-4 text-blue-500" /> },
  { id: 'highfail', name: '오답률 높은 문제', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
];

type SortField = 'id' | 'title' | 'difficulty' | 'acceptanceRate' | 'solvedCount';
type SortOrder = 'asc' | 'desc';

const ProblemListPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState(MOCK_PROBLEMS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 검색어와 필터에 따라 문제 목록 필터링 및 정렬
  useEffect(() => {
    let filtered = MOCK_PROBLEMS;
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.id.toString().includes(searchTerm)
      );
    }
    
    // 난이도 필터링
    if (selectedDifficulty) {
      filtered = filtered.filter(problem => problem.difficulty === selectedDifficulty);
    }
    
    // 카테고리 필터링
    if (selectedCategory) {
      filtered = filtered.filter(problem => problem.category === selectedCategory);
    }
    
    // 상태 필터링
    if (selectedStatus) {
      filtered = filtered.filter(problem => problem.status === selectedStatus);
    }
    
    // 특별 필터 (새로운/인기/오답률 높은)
    if (selectedFilter === 'new') {
      filtered = filtered.filter(problem => problem.isNew);
    } else if (selectedFilter === 'popular') {
      filtered = filtered.filter(problem => problem.isPopular);
    } else if (selectedFilter === 'highfail') {
      filtered = filtered.filter(problem => problem.isHighFailRate);
    }
    
    // 정렬
    filtered = [...filtered].sort((a, b) => {
      if (sortField === 'difficulty') {
        // 난이도 정렬 (브론즈 < 실버 < 골드 < 플래티넘 < 다이아몬드)
        const difficultyMap: Record<string, number> = {
          '브론즈 5': 1, '브론즈 4': 2, '브론즈 3': 3, '브론즈 2': 4, '브론즈 1': 5,
          '실버 5': 6, '실버 4': 7, '실버 3': 8, '실버 2': 9, '실버 1': 10,
          '골드 5': 11, '골드 4': 12, '골드 3': 13, '골드 2': 14, '골드 1': 15,
          '플래티넘 5': 16, '플래티넘 4': 17, '플래티넘 3': 18, '플래티넘 2': 19, '플래티넘 1': 20,
          '다이아몬드 5': 21, '다이아몬드 4': 22, '다이아몬드 3': 23, '다이아몬드 2': 24, '다이아몬드 1': 25,
        };
        const aValue = difficultyMap[a.difficulty] || 0;
        const bValue = difficultyMap[b.difficulty] || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortField === 'acceptanceRate') {
        return sortOrder === 'asc' ? a.acceptanceRate - b.acceptanceRate : b.acceptanceRate - a.acceptanceRate;
      } else if (sortField === 'solvedCount') {
        return sortOrder === 'asc' ? a.solvedCount - b.solvedCount : b.solvedCount - a.solvedCount;
      } else if (sortField === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } else {
        // 기본 정렬 (ID)
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      }
    });
    
    setFilteredProblems(filtered);
  }, [searchTerm, selectedDifficulty, selectedCategory, selectedStatus, selectedFilter, sortField, sortOrder]);

  // 난이도에 따른 배지 색상
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('브론즈')) {
      return 'bg-amber-100 text-amber-800';
    } else if (difficulty.includes('실버')) {
      return 'bg-gray-200 text-gray-700';
    } else if (difficulty.includes('골드')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (difficulty.includes('플래티넘')) {
      return 'bg-teal-100 text-teal-800';
    } else if (difficulty.includes('다이아몬드')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // 상태에 따른 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'attempted':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // 정렬 토글
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 중복 제거된 카테고리 목록
  const categories = Array.from(new Set(MOCK_PROBLEMS.map(p => p.category)));
  
  // 중복 제거된 난이도 목록
  const difficulties = Array.from(new Set(MOCK_PROBLEMS.map(p => p.difficulty)));

  // 상태 목록
  const statuses = [
    { value: 'solved', label: '해결됨' },
    { value: 'attempted', label: '시도함' },
    { value: 'unsolved', label: '미해결' },
    { value: 'locked', label: '잠김' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DeepCodingHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* 문제 카테고리 탭 */}
        <div className="bg-white rounded-t-xl shadow-sm p-4 mb-1 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {PROBLEM_CATEGORIES.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(category.id === 'all' ? null : category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* 문제 필터 탭 */}
        <div className="bg-white shadow-sm p-4 mb-1 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {PROBLEM_FILTERS.map(filter => (
              <button
                key={filter.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedFilter === filter.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.icon}
                {filter.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-b-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">코딩 문제 목록</h1>
          
          {/* 검색 및 필터 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="문제 검색 (번호 또는 제목)..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
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
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
              >
                <option value="">상태</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty(null);
                  setSelectedCategory(null);
                  setSelectedStatus(null);
                  setSelectedFilter('all');
                  setSortField('id');
                  setSortOrder('asc');
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
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center">
                      번호
                      {sortField === 'id' && (
                        <ArrowUpDown className={`ml-1 w-3 h-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center">
                      제목
                      {sortField === 'title' && (
                        <ArrowUpDown className={`ml-1 w-3 h-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('difficulty')}
                  >
                    <div className="flex items-center">
                      난이도
                      {sortField === 'difficulty' && (
                        <ArrowUpDown className={`ml-1 w-3 h-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분류
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('solvedCount')}
                  >
                    <div className="flex items-center">
                      맞은 사람
                      {sortField === 'solvedCount' && (
                        <ArrowUpDown className={`ml-1 w-3 h-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('acceptanceRate')}
                  >
                    <div className="flex items-center">
                      정답률
                      {sortField === 'acceptanceRate' && (
                        <ArrowUpDown className={`ml-1 w-3 h-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${problem.status === 'locked' ? 'opacity-60' : ''}`}
                    onClick={() => problem.status !== 'locked' && navigate(`/deepcoding/problems/${problem.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {problem.id}
                      {problem.isNew && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                      {getStatusIcon(problem.status)}
                      <span className="ml-2">{problem.title}</span>
                      {problem.isPopular && (
                        <span className="ml-2 text-blue-500">
                          <BarChart size={14} />
                        </span>
                      )}
                      {problem.isHighFailRate && (
                        <span className="ml-2 text-red-500">
                          <AlertTriangle size={14} />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                          {problem.category}
                        </span>
                        {problem.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {problem.solvedCount}명
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