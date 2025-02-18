import { FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEnrolledCourses, getDownloadUrl } from '@/services/api/courses';
import type { 
  Course as BaseCourse, 
  WeekMaterial, 
  Week 
} from '@/types/course';
import { 
  Bell, FileText, HelpCircle, PlayCircle, BookOpen, Download, Calendar, Video, User,
  PenLine, MessageSquare, Award, BarChart, ChevronDown, BrainCircuit,
  Film, Image as ImageIcon, FileIcon, File, Play, Lock
} from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import * as Accordion from '@radix-ui/react-accordion';
import { Button } from '@/components/common/ui/button';
import { toast } from 'sonner';
import VideoModal from '@/components/video/VideoModal';
import FileDownloader from '@/components/common/FileDownloader';
import { cn } from '@/lib/utils';

interface Course extends BaseCourse {
  weeks: Week[];
  enrolled_at: string;
  enrollment_status: string;
  progress_status: string;
  last_accessed_at: string;
}

const transformApiResponse = (apiCourse: any): Course => {
  // 주차별 자료 변환
  const transformedWeeks = apiCourse.weeks?.map((week: any) => {
    // 파일들을 카테고리별로 분류
    const categorizedMaterials: { [key: string]: WeekMaterial[] } = {
      quiz: [],
      document: [],
      video: [],
      image: [],
      spreadsheet: [],
      unknown: []
    };

    // 파일들을 카테고리별로 분류
    Object.entries(week.materials || {}).forEach(([category, files]: [string, any]) => {
      files.forEach((file: any) => {
        // json 카테고리의 파일을 quiz 카테고리로 변환
        const targetCategory = category === 'json' ? 'quiz' : category;
        if (targetCategory in categorizedMaterials) {
          categorizedMaterials[targetCategory].push(file);
        } else {
          console.warn(`Unknown category: ${category}, file: ${file.fileName}`);
          categorizedMaterials.unknown.push(file);
        }
      });
    });

    return {
      ...week,
      materials: categorizedMaterials
    };
  }) || [];

  return {
    ...apiCourse,
    weeks: transformedWeeks
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
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
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

  const handleFileClick = async (downloadUrl: string | null, fileName: string, streamingUrl?: string | null) => {
    if (fileName.endsWith('.m3u8')) {
      const videoUrl = streamingUrl || downloadUrl;
      if (!videoUrl) {
        toast.error('비디오 URL이 유효하지 않습니다.');
        return;
      }
      // 모달 대신 비디오 페이지로 이동
      navigate(`/mycourse/${selectedCourse?.id}/week/${openWeeks[0]}/video/${encodeURIComponent(fileName)}`, {
        state: {
          videoUrl,
          title: fileName.replace('.m3u8', ''),
          courseId: selectedCourse?.id,
          weekId: openWeeks[0]
        }
      });
      return;
    }

    // 일반 파일은 다운로드
    if (!downloadUrl) {
      toast.error('다운로드 URL이 유효하지 않습니다.');
      return;
    }

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const decodedFileName = decodeURIComponent(fileName);
      a.download = decodedFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('파일 다운로드에 실패했습니다.');
      // 다운로드 실패 시 downloadUrl이 있다면 새 탭에서 열기 시도
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
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

  // 파일 타입별 아이콘 매핑
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'm3u8':
        return <Play className="w-5 h-5 text-purple-500" />;
      case 'json':
        return <BrainCircuit className="w-5 h-5 text-purple-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-5 h-5 text-blue-700" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Film className="w-5 h-5 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;  // 기본 아이콘을 File에서 FileText로 변경
    }
  };

  // 파일 타입 표시 이름 가져오기
  const getFileTypeName = (type: string) => {
    switch (type) {
      case 'quiz':
        return '퀴즈';
      case 'document':
        return '강의 자료';
      case 'video':
        return '동영상';
      case 'image':
        return '이미지';
      case 'spreadsheet':
        return '스프레드시트';
      default:
        return '기타';
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 주차별 자료 렌더링 함수 수정
  const renderWeekMaterials = (materials: { [key: string]: WeekMaterial[] }, weekNumber: number) => {
    const renderMaterialList = (items: WeekMaterial[] | undefined, type: string) => {
      if (!items || items.length === 0) return null;

      return (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">{getFileTypeName(type)}</h4>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleFileClick(item.downloadUrl, item.fileName, item.streamingUrl)}
                  className={cn(
                    "w-full flex items-center p-2 rounded-lg group",
                    item.downloadable 
                      ? "hover:bg-gray-50" 
                      : "opacity-75 cursor-not-allowed bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(item.fileName)}
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm",
                        item.downloadable ? "text-gray-700" : "text-gray-400"
                      )}>
                        {item.fileName}
                      </span>
                      {!item.downloadable && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          다운로드 제한됨
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs",
                    item.downloadable ? "text-gray-500" : "text-gray-400"
                  )}>
                    {formatFileSize(item.size)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {Object.entries(materials).map(([type, items]) => renderMaterialList(items, type))}
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

            {selectedCourse?.classmode === 'ONLINE' && selectedCourse?.zoom_link && (
              <a 
                href={selectedCourse.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-all duration-200"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                실시간 수업 입장
              </a>
            )}
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
                          {renderWeekMaterials(week.materials, week.weekNumber)}
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
      
      {/* 비디오 모달 추가 */}
      {selectedVideo && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => {
            setVideoModalOpen(false);
            setSelectedVideo(null);
          }}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
};

export default StudentCoursesPage; 