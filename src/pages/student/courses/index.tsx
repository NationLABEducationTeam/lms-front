import { FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEnrolledCourses } from '@/services/api/courses';
import { Course as BaseCourse } from '@/types/course';
import { 
  Bell, FileText, HelpCircle, PlayCircle, BookOpen, Download, Calendar, Video, User,
  PenLine, MessageSquare, Award, BarChart, ChevronDown
} from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import * as Accordion from '@radix-ui/react-accordion';

// 주차별 자료 타입 정의
interface Material {
  fileName: string;
  downloadUrl: string;
  lastModified: string;
  size: number;
}

interface WeekMaterials {
  document?: Material[];
  video?: Material[];
  quiz?: Material[];
  spreadsheet?: Material[];  // 엑셀 파일을 위한 필드 추가
  image?: Material[];
  unknown?: Material[];
}

interface Week {
  weekName: string;
  weekNumber: number;
  materials: WeekMaterials;
}

interface Course extends BaseCourse {
  weeks: Week[];
  enrolled_at: string;
  enrollment_status: string;
  progress_status: string;
  last_accessed_at: string;
}

const transformApiResponse = (apiCourse: any): Course => {
  return {
    ...apiCourse,
    weeks: apiCourse.weeks || []
  };
};

const StudentCoursesPage: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notices' | 'assignments' | 'qna' | 'notes' | 'posts' | 'progress'>('curriculum');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.accessToken) {
          navigate('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth/login');
        return;
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await getEnrolledCourses();
        console.log('Enrolled courses response:', response);
        const fetchedCourses = response.courses.map(transformApiResponse) || [];
        setCourses(fetchedCourses);
        // 첫 번째 강의를 기본 선택
        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0]);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setError(error instanceof Error ? error.message : '수강 목록을 불러오는데 실패했습니다.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth().then(() => fetchEnrolledCourses());
  }, [navigate]);

  // URL 해시 기반 상태 관리
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#week-')) {
      const weekNumber = hash.replace('#week-', '');
      setOpenWeeks([weekNumber]);
    }
  }, []);

  const handleWeekToggle = (weekNumbers: string[]) => {
    setOpenWeeks(weekNumbers);
    if (weekNumbers.length > 0) {
      const lastOpenedWeek = weekNumbers[weekNumbers.length - 1];
      window.history.replaceState(null, '', `#week-${lastOpenedWeek}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-700"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">수강 중인 강의가 없습니다</h3>
            <p className="text-gray-600 mb-6">새로운 강의를 수강해보세요!</p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              강의 둘러보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 실시간 수업 입장 가능 여부 체크 (현재 시간 기준 15분 전부터 입장 가능)
  const isLiveClassAvailable = selectedCourse ? new Date(selectedCourse.created_at).getTime() - Date.now() <= 15 * 60 * 1000 : false;

  // 파일 아이콘 선택 함수 수정
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'wmv':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-5 h-5 text-pink-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // 파일 타입 표시 이름 가져오기
  const getFileTypeName = (type: string) => {
    switch (type) {
      case 'document':
        return '강의 자료';
      case 'video':
        return '강의 영상';
      case 'image':
        return '이미지';
      case 'spreadsheet':
        return '엑셀 자료';
      case 'unknown':
        return '기타 자료';
      default:
        return type;
    }
  };

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 주차별 자료 렌더링 함수 수정
  const renderWeekMaterials = (materials: WeekMaterials) => {
    // 모든 파일 타입을 포함하도록 수정
    const renderMaterialList = (items: Material[] | undefined, type: string) => {
      if (!items || items.length === 0) return null;
      
      return (
        <div className="mb-6 last:mb-0">
          <h4 className="text-sm font-medium text-slate-500 mb-2">{getFileTypeName(type)}</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center">
                  {getFileIcon(item.fileName)}
                  <div className="ml-3">
                    <div className="font-medium text-slate-900">{item.fileName}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(item.lastModified).toLocaleDateString()} • {formatFileSize(item.size)}
                    </div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {renderMaterialList(materials.document, 'document')}
        {renderMaterialList(materials.spreadsheet, 'spreadsheet')}
        {renderMaterialList(materials.video, 'video')}
        {renderMaterialList(materials.image, 'image')}
        {renderMaterialList(materials.unknown, 'unknown')}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Course Selection Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg text-slate-900">
                      {selectedCourse?.title}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center mt-0.5">
                      <User className="w-4 h-4 mr-1.5" />
                      <span>{selectedCourse?.instructor_name}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>{new Date(selectedCourse?.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900">{course.title}</div>
                        <div className="text-sm text-slate-500 flex items-center mt-1">
                          <User className="w-4 h-4 mr-1.5" />
                          <span>{course.instructor_name}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>{new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              className={`inline-flex items-center px-5 py-2.5 rounded-lg transition-all duration-200 ${
                isLiveClassAvailable
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!isLiveClassAvailable}
              title={!isLiveClassAvailable ? "수업 시작 15분 전부터 입장 가능합니다" : undefined}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {isLiveClassAvailable ? '실시간 수업 입장' : '수업 준비중'}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Navigation Menu */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'curriculum'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">커리큘럼</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'progress'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart className="w-5 h-5" />
                <span className="font-medium">학습 현황</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PenLine className="w-5 h-5" />
                <span className="font-medium">강의 노트</span>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">게시글</span>
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notices'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">공지사항</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                  N
                </span>
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'assignments'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">과제</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                  2
                </span>
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'qna'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">질의응답</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  1
                </span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <Accordion.Root 
                  type="multiple" 
                  value={openWeeks}
                  onValueChange={handleWeekToggle}
                  className="space-y-4"
                >
                  {selectedCourse?.weeks.map((week) => (
                    <Accordion.Item 
                      key={week.weekNumber} 
                      value={week.weekNumber.toString()}
                      className="rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="w-full">
                          <div className="flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {week.weekNumber}주차
                            </h3>
                            <ChevronDown 
                              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                                openWeeks.includes(week.weekNumber.toString()) ? 'transform rotate-180' : ''
                              }`}
                            />
                          </div>
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content>
                        <div className="p-6 bg-white border-t border-slate-200">
                          {renderWeekMaterials(week.materials)}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
                {(!selectedCourse?.weeks || selectedCourse.weeks.length === 0) && (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">등록된 강의 자료가 없습니다</h3>
                    <p className="mt-2 text-sm text-gray-500">강의 자료가 곧 업로드될 예정입니다.</p>
                  </div>
                )}
              </div>
            )}
            {/* ... other tab contents ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage; 