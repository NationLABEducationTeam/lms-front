import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { ArrowLeft, Play, Check, AlertCircle, Clock, ChevronDown, ChevronUp, Bookmark, Send, Users, BarChart, FileText } from 'lucide-react';
import DeepCodingHeader from '@/components/deepcoding/DeepCodingHeader';
import CodeEditor from '@/components/deepcoding/CodeEditor';
import axios from 'axios';

// 람다 함수 엔드포인트
const LAMBDA_ENDPOINT = 'https://ruc2jhblgciu6sqw256ss3ugdi0xdwdh.lambda-url.ap-northeast-2.on.aws/';

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
    memoryLimit: '256MB',
    timeLimit: '1초',
    description: `
      <h3>문제 설명</h3>
      <p>정수 배열 nums와 정수 target이 주어지면, 배열에서 두 수의 합이 target이 되는 두 수의 인덱스를 반환하세요.</p>
      <p>각 입력에 정확히 하나의 해가 있다고 가정하며, 같은 요소를 두 번 사용할 수 없습니다.</p>
      
      <h3>예시</h3>
      <pre>
      입력: nums = [2,7,11,15], target = 9
      출력: [0,1]
      설명: nums[0] + nums[1] == 9이므로, [0, 1]을 반환합니다.
      </pre>
      
      <h3>제한사항</h3>
      <ul>
        <li>2 <= nums.length <= 10^4</li>
        <li>-10^9 <= nums[i] <= 10^9</li>
        <li>-10^9 <= target <= 10^9</li>
        <li>정확히 하나의 유효한 답이 존재합니다.</li>
      </ul>
    `,
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    hints: [
      '브루트 포스 방식으로 모든 쌍을 확인하면 O(n²) 시간이 걸립니다. 더 효율적인 방법이 있을까요?',
      '해시맵을 사용하면 각 요소를 한 번만 확인하면서 문제를 해결할 수 있습니다.',
      '각 요소를 확인할 때, target - 현재 요소 = 찾아야 할 다른 요소입니다.'
    ],
    solution: `
      <h3>해결 방법</h3>
      <p>이 문제는 해시맵을 사용하여 O(n) 시간 복잡도로 해결할 수 있습니다.</p>
      <pre>
      1. 빈 해시맵을 생성합니다.
      2. 배열을 순회하면서 각 요소에 대해:
         a. target - 현재 요소 = 찾아야 할 다른 요소
         b. 해시맵에서 찾아야 할 다른 요소가 있는지 확인합니다.
         c. 있다면, 해당 요소의 인덱스와 현재 요소의 인덱스를 반환합니다.
         d. 없다면, 현재 요소와 인덱스를 해시맵에 저장합니다.
      3. 모든 요소를 확인한 후에도 답을 찾지 못했다면, 유효한 답이 없는 것입니다.
      </pre>
      <p>이 방법은 배열을 한 번만 순회하므로 시간 복잡도는 O(n)이고, 공간 복잡도도 O(n)입니다.</p>
    `,
    defaultCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // 여기에 코드를 작성하세요
    
}`,
      python: `def two_sum(nums, target):
    # 여기에 코드를 작성하세요
    
    return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 여기에 코드를 작성하세요
        
        return new int[]{0, 0};
    }
}`
    }
  },
  {
    id: 1008,
    title: '팰린드롬 확인',
    difficulty: '브론즈 2',
    category: '문자열',
    tags: ['문자열', '투 포인터'],
    solvedCount: 987,
    submissionCount: 1450,
    acceptanceRate: 68,
    memoryLimit: '256MB',
    timeLimit: '1초',
    description: `
      <h3>문제 설명</h3>
      <p>주어진 문자열이 팰린드롬인지 확인하는 함수를 작성하세요. 팰린드롬이란 앞에서부터 읽으나 뒤에서부터 읽으나 같은 문자열을 말합니다.</p>
      <p>대소문자를 구분하지 않으며, 알파벳과 숫자만 고려합니다. 다른 모든 문자는 무시합니다.</p>
      
      <h3>예시</h3>
      <pre>
      입력: s = "A man, a plan, a canal: Panama"
      출력: true
      설명: "amanaplanacanalpanama"는 팰린드롬입니다.
      </pre>
      
      <h3>제한사항</h3>
      <ul>
        <li>1 <= s.length <= 2 * 10^5</li>
        <li>s는 ASCII 문자로만 구성됩니다.</li>
      </ul>
    `,
    testCases: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true'
      },
      {
        input: 's = "race a car"',
        output: 'false'
      },
      {
        input: 's = " "',
        output: 'true'
      },
      {
        input: 's = "Was it a car or a cat I saw?"',
        output: 'true'
      },
      {
        input: 's = "0P"',
        output: 'false'
      },
      {
        input: 's = "a."',
        output: 'true'
      },
      {
        input: 's = ".,;!@#$%^&*()_+-={}[]|\\:\'\"<>?/"',
        output: 'true'
      },
      {
        input: 's = "Madam, I\'m Adam."',
        output: 'true'
      },
      {
        input: 's = "A Santa at NASA"',
        output: 'true'
      },
      {
        input: 's = "No lemon, no melon"',
        output: 'true'
      }
    ],
    hints: [
      '문자열에서 알파벳과 숫자만 추출하여 새로운 문자열을 만들어 보세요.',
      '대소문자를 구분하지 않으므로, 모든 문자를 소문자(또는 대문자)로 변환하세요.',
      '투 포인터 기법을 사용하여 문자열의 양 끝에서부터 중앙으로 이동하며 비교할 수도 있습니다.'
    ],
    solution: `
      <h3>해결 방법 1: 문자열 정제 후 비교</h3>
      <p>이 방법은 먼저 문자열에서 알파벳과 숫자만 추출하여 모두 소문자로 변환한 후, 이 문자열이 뒤집어도 같은지 확인합니다.</p>
      <pre>
      1. 빈 문자열을 생성합니다.
      2. 원본 문자열을 순회하면서 알파벳과 숫자만 추출하여 소문자로 변환 후 새 문자열에 추가합니다.
      3. 새 문자열과 그 문자열을 뒤집은 것이 같은지 비교합니다.
      </pre>
      
      <h3>해결 방법 2: 투 포인터 기법</h3>
      <p>이 방법은 문자열의 양 끝에서 시작하여 중앙으로 이동하며 문자를 비교합니다.</p>
      <pre>
      1. 왼쪽 포인터는 0, 오른쪽 포인터는 문자열 길이 - 1로 초기화합니다.
      2. 두 포인터가 교차할 때까지 다음을 반복합니다:
         a. 왼쪽 포인터가 알파벳이나 숫자가 아니면 오른쪽으로 이동합니다.
         b. 오른쪽 포인터가 알파벳이나 숫자가 아니면 왼쪽으로 이동합니다.
         c. 두 포인터가 가리키는 문자를 소문자로 변환하여 비교합니다.
         d. 다르면 false를 반환합니다.
         e. 같으면 왼쪽 포인터는 오른쪽으로, 오른쪽 포인터는 왼쪽으로 이동합니다.
      3. 모든 비교가 끝나면 true를 반환합니다.
      </pre>
      
      <p>두 방법 모두 시간 복잡도는 O(n)이지만, 두 번째 방법은 추가 공간을 사용하지 않으므로 공간 복잡도가 O(1)입니다.</p>
    `,
    defaultCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // 여기에 코드를 작성하세요
    
}`,
      python: `def is_palindrome(s):
    # 여기에 코드를 작성하세요
    
    return True`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // 여기에 코드를 작성하세요
        
        return true;
    }
}`
    }
  },
  // 다른 문제들...
];

interface TestResult {
  status: 'success' | 'error' | 'running';
  message: string;
  testCase?: {
    input: string;
    output: string;
    expected: string;
  };
  performance?: {
    executionTime: string;
    memoryUsage: string;
    cpuUsage?: string;
  };
}

interface SubmissionResult {
  status: 'success' | 'error' | 'running';
  message: string;
  executionTime?: string;
  memoryUsage?: string;
  cpuUsage?: string;
  testCasesPassed?: number;
  totalTestCases?: number;
  submissionId?: string;
  ranking?: {
    executionTime?: {
      rank: number;
      total: number;
      percentile: number;
    };
    memoryUsage?: {
      rank: number;
      total: number;
      percentile: number;
    };
  };
  detailedResults?: TestResult[];
}

const ProblemDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // 실제로는 API 호출로 대체
    const foundProblem = MOCK_PROBLEMS.find(p => p.id === Number(id));
    if (foundProblem) {
      setProblem(foundProblem);
      
      // 저장된 코드가 있는지 확인
      const savedCode = localStorage.getItem(`problem_${id}_${language}`);
      
      if (savedCode) {
        setCode(savedCode);
      } else if (language === 'javascript' || language === 'python' || language === 'java') {
        setCode(foundProblem.defaultCode[language as keyof typeof foundProblem.defaultCode]);
      }
    }
  }, [id, language]);

  const handleLanguageChange = (lang: string) => {
    if (problem && problem.defaultCode && (lang === 'javascript' || lang === 'python' || lang === 'java')) {
      setLanguage(lang);
      
      // 저장된 코드가 있는지 확인
      const savedCode = localStorage.getItem(`problem_${id}_${lang}`);
      
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(problem.defaultCode[lang as keyof typeof problem.defaultCode]);
      }
    }
  };

  // 코드 저장
  const saveCode = () => {
    if (id && language) {
      localStorage.setItem(`problem_${id}_${language}`, code);
      alert('코드가 저장되었습니다.');
    }
  };

  // 코드 초기화
  const resetCode = () => {
    if (problem && language && (language === 'javascript' || language === 'python' || language === 'java')) {
      if (confirm('정말 코드를 초기화하시겠습니까?')) {
        setCode(problem.defaultCode[language as keyof typeof problem.defaultCode]);
        localStorage.removeItem(`problem_${id}_${language}`);
      }
    }
  };

  // 코드 실행 (UI에 표시된 테스트 케이스로만 테스트)
  const runCode = async () => {
    setIsRunning(true);
    setTestResults([{ status: 'running', message: '코드 실행 중...' }]);
    
    try {
      // UI에 표시된 테스트 케이스만 사용
      const testCases = problem.testCases.map((tc: { input: string, output: string }) => ({
        input: tc.input,
        expected: tc.output
      }));
      
      // 람다 함수 API 호출
      const response = await axios.post(LAMBDA_ENDPOINT, {
        code,
        language,
        action: 'test', // 테스트 실행 액션
        testCases: testCases, // UI에 표시된 테스트 케이스만 전송
        problemId: problem.id // 문제 ID 추가
      });
      
      // 응답 처리
      if (response.data && response.data.results) {
        setTestResults(response.data.results);
      } else {
        throw new Error('서버에서 유효한 응답을 받지 못했습니다.');
      }
    } catch (error) {
      setTestResults([{
        status: 'error',
        message: '코드 실행 중 오류가 발생했습니다: ' + (error as Error).message
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  // 코드 제출 (람다 함수로 전송)
  const submitCode = async () => {
    setIsSubmitting(true);
    setSubmissionResult({
      status: 'running',
      message: '코드 제출 중...'
    });
    
    try {
      // 람다 함수 API 호출 (제출 시에는 서버에서 모든 테스트 케이스 실행)
      const response = await axios.post(LAMBDA_ENDPOINT, {
        code,
        language,
        action: 'submit', // 제출 액션
        problemId: problem.id // 문제 ID 추가
      });
      
      // 응답 처리
      if (response.data) {
        setSubmissionResult({
          status: response.data.status,
          message: response.data.message,
          executionTime: response.data.executionTime,
          memoryUsage: response.data.memoryUsage,
          cpuUsage: response.data.cpuUsage,
          testCasesPassed: response.data.testCasesPassed,
          totalTestCases: response.data.totalTestCases,
          submissionId: response.data.submissionId,
          ranking: response.data.ranking,
          detailedResults: response.data.detailedResults
        });
      } else {
        throw new Error('서버에서 유효한 응답을 받지 못했습니다.');
      }
    } catch (error) {
      setSubmissionResult({
        status: 'error',
        message: '코드 제출 중 오류가 발생했습니다: ' + (error as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>문제를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DeepCodingHeader />
      
      <div className="container mx-auto py-4">
        {problem ? (
          <div>
            {/* 상단 헤더 영역 - 더 간결하게 */}
            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => navigate('/deepcoding/problems')}
              >
                <ArrowLeft size={16} />
                목록
              </Button>
              
              <h1 className="text-xl font-bold flex-1">{problem.title}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">난이도:</span>
                  <span className="font-medium text-sm">{problem.difficulty}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">시간:</span>
                  <span className="font-medium text-sm">{problem.timeLimit}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">메모리:</span>
                  <span className="font-medium text-sm">{problem.memoryLimit}</span>
                </div>
              </div>
            </div>
            
            {/* 메인 콘텐츠 영역 - 그리드 레이아웃 */}
            <div className="grid grid-cols-12 gap-4">
              {/* 왼쪽: 문제 설명 */}
              <div className="col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
                <Tabs defaultValue="description" className="w-full h-[calc(100vh-180px)] flex flex-col">
                  <div className="border-b">
                    <div className="px-2">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="description">문제</TabsTrigger>
                        <TabsTrigger value="examples">예제</TabsTrigger>
                        <TabsTrigger value="hints">힌트</TabsTrigger>
                        <TabsTrigger value="solution">해결책</TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                  
                  <div className="p-3 overflow-y-auto flex-1">
                    <TabsContent value="description" className="mt-0 h-full">
                      <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                    </TabsContent>
                    
                    <TabsContent value="examples" className="mt-0 h-full">
                      <div className="space-y-3">
                        {problem.testCases.map((testCase: { input: string, output: string }, index: number) => (
                          <div key={index} className="bg-gray-50 p-2 rounded-md border border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="font-medium text-xs mb-1">입력:</p>
                                <pre className="bg-white p-2 rounded text-xs border border-gray-200 overflow-x-auto">{testCase.input}</pre>
                              </div>
                              <div>
                                <p className="font-medium text-xs mb-1">출력:</p>
                                <pre className="bg-white p-2 rounded text-xs border border-gray-200 overflow-x-auto">{testCase.output}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="hints" className="mt-0 h-full">
                      <div className="space-y-2">
                        {problem.hints.map((hint: string, index: number) => (
                          <div key={index} className="bg-blue-50 p-2 rounded-md border border-blue-100">
                            <p className="font-medium text-xs mb-1">힌트 {index + 1}</p>
                            <p className="text-xs text-gray-700">{hint}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="solution" className="mt-0 h-full">
                      <div dangerouslySetInnerHTML={{ __html: problem.solution }} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              
              {/* 오른쪽: 코드 에디터 */}
              <div className="col-span-7 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="border-b p-2 flex justify-between items-center">
                  <div className="flex gap-2">
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetCode}
                      className="h-8 px-2"
                    >
                      초기화
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveCode}
                      className="h-8 px-2"
                    >
                      저장
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3"
                      size="sm"
                      onClick={runCode}
                      disabled={isRunning}
                    >
                      {isRunning ? '실행 중...' : '실행'}
                      {!isRunning && <Play size={14} className="ml-1" />}
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                      size="sm"
                      onClick={submitCode}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '제출 중...' : '제출'}
                      {!isSubmitting && <Send size={14} className="ml-1" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0">
                  <CodeEditor
                    code={code}
                    language={language}
                    onChange={setCode}
                  />
                </div>
                
                {/* 결과 영역 - 아코디언 스타일로 개선 */}
                <div className="border-t">
                  <Tabs defaultValue="testResults" className="w-full">
                    <div className="bg-gray-50 border-b">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="testResults" className="text-xs py-1">
                          실행 결과
                          {testResults.length > 0 && (
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                              testResults.every(r => r.status === 'success') 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {testResults.filter(r => r.status === 'success').length}/{testResults.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="submissionResults" className="text-xs py-1">
                          제출 결과
                          {submissionResult && submissionResult.status !== 'running' && (
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                              submissionResult.status === 'success'
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submissionResult.testCasesPassed}/{submissionResult.totalTestCases}
                            </span>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="h-[180px] overflow-y-auto">
                      <TabsContent value="testResults" className="p-0 m-0">
                        {testResults.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">코드를 실행하여 결과를 확인하세요.</p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {testResults.map((result, index) => (
                              <details 
                                key={index} 
                                className="border rounded-md overflow-hidden group"
                                open={index === 0}
                              >
                                <summary className={`p-2 flex justify-between items-center cursor-pointer ${
                                  result.status === 'success' ? 'bg-green-50 border-green-200' : 
                                  result.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    {result.status === 'success' ? (
                                      <Check className="text-green-500" size={14} />
                                    ) : result.status === 'error' ? (
                                      <AlertCircle className="text-red-500" size={14} />
                                    ) : (
                                      <Clock className="text-gray-500" size={14} />
                                    )}
                                    <span className="font-medium text-xs">테스트 케이스 {index + 1}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {result.performance && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={10} />
                                        <span>{result.performance.executionTime}</span>
                                        <BarChart size={10} className="ml-1" />
                                        <span>{result.performance.memoryUsage}</span>
                                      </div>
                                    )}
                                    <ChevronDown size={14} className="text-gray-400 group-open:rotate-180 transition-transform" />
                                  </div>
                                </summary>
                                
                                <div className="p-2 bg-white text-xs">
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <p className="text-gray-500 mb-1 text-xs">입력:</p>
                                      <pre className="bg-gray-50 p-1.5 rounded border border-gray-200 overflow-x-auto text-xs">{result.testCase?.input}</pre>
                                    </div>
                                    <div>
                                      <div className="grid grid-cols-2 gap-1">
                                        <div>
                                          <p className="text-gray-500 mb-1 text-center text-xs">내 출력:</p>
                                          <pre className={`p-1.5 rounded border overflow-x-auto text-xs ${
                                            result.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                          }`}>{result.testCase?.output || '(출력 없음)'}</pre>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 mb-1 text-center text-xs">정답:</p>
                                          <pre className="p-1.5 rounded border border-gray-200 bg-white overflow-x-auto text-xs">{result.testCase?.expected}</pre>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {result.status === 'error' && result.message && (
                                    <div className="text-red-600 p-1.5 bg-red-50 rounded border border-red-200 text-xs">
                                      {result.message}
                                    </div>
                                  )}
                                </div>
                              </details>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="submissionResults" className="p-0 m-0">
                        {!submissionResult ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">코드를 제출하여 결과를 확인하세요.</p>
                          </div>
                        ) : (
                          <div className="p-2">
                            <div className={`p-2 rounded-md ${
                              submissionResult.status === 'success' ? 'bg-green-50 border border-green-200' : 
                              submissionResult.status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  {submissionResult.status === 'success' ? (
                                    <Check className="text-green-500" size={14} />
                                  ) : submissionResult.status === 'error' ? (
                                    <AlertCircle className="text-red-500" size={14} />
                                  ) : (
                                    <Clock className="text-gray-500" size={14} />
                                  )}
                                  <span className="font-medium text-xs">
                                    {submissionResult.message}
                                  </span>
                                </div>
                                
                                {submissionResult.status !== 'running' && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock size={10} />
                                      <span>{submissionResult.executionTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BarChart size={10} />
                                      <span>{submissionResult.memoryUsage}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {submissionResult.status !== 'running' && (
                                <>
                                  <div className="flex items-center justify-between mb-1 text-xs">
                                    <span>테스트 케이스:</span>
                                    <span className="font-medium">
                                      {submissionResult.testCasesPassed} / {submissionResult.totalTestCases} 통과
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                                    <div 
                                      className={`h-1 rounded-full ${submissionResult.status === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                                      style={{ 
                                        width: `${submissionResult.testCasesPassed && submissionResult.totalTestCases 
                                          ? (submissionResult.testCasesPassed / submissionResult.totalTestCases * 100) 
                                          : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {submissionResult.status === 'success' && submissionResult.ranking && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {submissionResult.ranking.executionTime && (
                                  <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs text-gray-600">실행 시간 순위:</p>
                                      <p className="font-bold text-xs text-indigo-700">
                                        {submissionResult.ranking.executionTime.rank}위
                                        <span className="text-xs font-normal text-gray-500 ml-1">
                                          (상위 {submissionResult.ranking.executionTime.percentile}%)
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {submissionResult.ranking.memoryUsage && (
                                  <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs text-gray-600">메모리 순위:</p>
                                      <p className="font-bold text-xs text-indigo-700">
                                        {submissionResult.ranking.memoryUsage.rank}위
                                        <span className="text-xs font-normal text-gray-500 ml-1">
                                          (상위 {submissionResult.ranking.memoryUsage.percentile}%)
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {submissionResult.detailedResults && (
                              <details className="mt-2 border rounded-md">
                                <summary className="p-2 bg-gray-50 cursor-pointer text-xs font-medium">
                                  상세 테스트 결과 보기
                                </summary>
                                <div className="p-2 space-y-2">
                                  {submissionResult.detailedResults.map((result, index) => (
                                    <details 
                                      key={index} 
                                      className="border rounded-md overflow-hidden group"
                                    >
                                      <summary className={`p-1.5 flex justify-between items-center cursor-pointer text-xs ${
                                        result.status === 'success' ? 'bg-green-50 border-green-200' : 
                                        result.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                                      }`}>
                                        <div className="flex items-center gap-1">
                                          {result.status === 'success' ? (
                                            <Check className="text-green-500" size={12} />
                                          ) : result.status === 'error' ? (
                                            <AlertCircle className="text-red-500" size={12} />
                                          ) : (
                                            <Clock className="text-gray-500" size={12} />
                                          )}
                                          <span>테스트 케이스 {index + 1}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          {result.performance && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                              <Clock size={10} />
                                              <span>{result.performance.executionTime}</span>
                                              <BarChart size={10} className="ml-1" />
                                              <span>{result.performance.memoryUsage}</span>
                                            </div>
                                          )}
                                          <ChevronDown size={12} className="text-gray-400 group-open:rotate-180 transition-transform" />
                                        </div>
                                      </summary>
                                      
                                      <div className="p-1.5 bg-white text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-gray-500 mb-1 text-xs">입력:</p>
                                            <pre className="bg-gray-50 p-1 rounded border border-gray-200 overflow-x-auto text-xs">{result.testCase?.input}</pre>
                                          </div>
                                          <div>
                                            <div className="grid grid-cols-2 gap-1">
                                              <div>
                                                <p className="text-gray-500 mb-1 text-center text-xs">내 출력:</p>
                                                <pre className={`p-1 rounded border overflow-x-auto text-xs ${
                                                  result.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                                }`}>{result.testCase?.output || '(출력 없음)'}</pre>
                                              </div>
                                              <div>
                                                <p className="text-gray-500 mb-1 text-center text-xs">정답:</p>
                                                <pre className="p-1 rounded border border-gray-200 bg-white overflow-x-auto text-xs">{result.testCase?.expected}</pre>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </details>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>문제를 불러오는 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetailPage;