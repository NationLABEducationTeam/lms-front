import { FC, useState, useEffect, useMemo } from 'react';
import { useAttendanceTimer } from '@/hooks/useAttendanceTimer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEnrolledCourses, getDownloadUrl } from '@/services/api/courses';
import { CATEGORY_MAPPING } from '@/types/course';
import type { 
  Course as BaseCourse, 
  WeekMaterial, 
  Week,
  MainCategoryId,
  VideoNotes,
  WeekNotes
} from '@/types/course';
import { 
  Bell, FileText, HelpCircle, PlayCircle, BookOpen, Download, Calendar, Video, User,
  PenLine, MessageSquare, Award, BarChart, ChevronDown, BrainCircuit,
  Film, Image as ImageIcon, FileIcon, File, Play, Lock, AlertCircle,
  BarChart2, Edit2, Trash2, Search, Upload, Clock, ChevronRight, Plus, AlertTriangle
} from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { 
  Layout, 
  Menu, 
  Card, 
  Button, 
  Tag, 
  Dropdown, 
  Space, 
  Progress, 
  List, 
  Avatar, 
  Typography,
  Collapse,
  Empty,
  Spin,
  Badge,
  Tabs,
  Select,
  Statistic,
  Divider,
  Alert,
  Modal
} from 'antd';
import { toast as sonnerToast } from 'sonner';
import { toast, ToastContainer } from 'react-toastify';
import VideoModal from '@/components/video/VideoModal';
import FileDownloader from '@/components/common/FileDownloader';
import { cn } from '@/lib/utils';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { getQnaPosts } from '@/services/api/qna';
import type { Notice, NoticeMetadata } from '@/types/notice';
import type { CommunityPost, CommunityMetadata } from '@/types/community';
import type { QnaPost, QnaMetadata } from '@/types/qna';
import { useGetAllNotesQuery } from '@/services/api/courseApi';
import { Note } from '@/types/course';
import { getApiUrl } from '@/config/api';
import { useGetStudentAssignmentsQuery, useGetCourseAssignmentsQuery } from '@/services/api/studentApi';
import { downloadFile } from '@/utils/fileDownload';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface Course extends BaseCourse {
  weeks: Week[];
  enrolled_at: string;
  enrollment_status: string;
  progress_status: string;
  progress?: number;
  last_accessed_at: string;
}

interface AssignmentItem {
  id: string;
  item_id: string;
  course_id: string;
  course_title: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  score?: number;
  max_score?: number;
  submission_date?: string;
  feedback?: string;
  week_number: number;
  type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ';
  item_type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ';
  is_completed: boolean;
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

const NotesPanel: FC = () => {
  const { data: notesData } = useGetAllNotesQuery();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };

  const toggleVideo = (videoId: string) => {
    setExpandedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const toggleNote = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const filteredNotes = useMemo(() => {
    if (!notesData?.data) return [];
    
    let courses = notesData.data;

    // 검색어로 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      courses = courses.map(course => ({
        ...course,
        videos: course.videos.map(video => ({
          ...video,
          notes: video.notes.filter(note => 
            note.content.toLowerCase().includes(term) ||
            (video.videoTitle || '').toLowerCase().includes(term)
          )
        })).filter(video => video.notes.length > 0)
      })).filter(course => course.videos.length > 0);
    }

    return courses;
  }, [notesData, searchTerm]);

  const handleVideoClick = (courseId: string, videoId: string, weekNumber: number, timestamp: number) => {
    if (!weekNumber) {
      console.error('주차 정보가 없습니다:', { courseId, videoId, weekNumber, timestamp });
      sonnerToast.error('동영상을 재생할 수 없습니다. 주차 정보가 없습니다.');
      return;
    }

    navigate(`/mycourse/${courseId}/week/${weekNumber}/video/${encodeURIComponent(videoId)}`, {
      state: {
        videoUrl: `${getApiUrl('')}/videos/${courseId}/${weekNumber}/${videoId}`,
        title: videoId.replace('.m3u8', ''),
        courseId,
        timestamp,
        weekNumber,
        weekTitle: `${weekNumber}주차 강의`
      }
    });
  };

  if (!notesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 통계 영역 */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="노트 내용이나 영상 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <Statistic
                title="전체 노트"
                value={filteredNotes.reduce((acc, course) => acc + course.totalNotes, 0)}
                prefix={<PenLine className="w-4 h-4" />}
              />
            </Card>
            <Card className="bg-purple-50">
              <Statistic
                title="영상 수"
                value={filteredNotes.reduce((acc, course) => acc + course.videoCount, 0)}
                prefix={<Film className="w-4 h-4" />}
              />
            </Card>
            <Card className="bg-green-50">
              <Statistic
                title="최근 업데이트"
                value={new Date(filteredNotes[0]?.lastUpdated).toLocaleDateString()}
                prefix={<Clock className="w-4 h-4" />}
              />
            </Card>
          </div>
        )}
      </div>

      {/* 노트 목록 */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">노트가 없습니다</p>
          <p className="text-sm text-gray-500">
            {searchTerm ? '검색 조건을 변경해보세요.' : '강의를 시청하면서 노트를 작성해보세요.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
            >
              {/* 과목 헤더 */}
              <button
                onClick={() => toggleCourse(course.courseId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{course.courseTitle}</h3>
                  <Badge 
                    count={course.totalNotes}
                    className="bg-blue-100 text-blue-600 border-blue-100"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    마지막 업데이트: {new Date(course.lastUpdated).toLocaleDateString()}
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      expandedCourses.has(course.courseId) ? "transform rotate-180" : ""
                    )} 
                  />
                </div>
              </button>

              {/* 영상별 노트 목록 */}
              {expandedCourses.has(course.courseId) && (
                <div className="border-t border-gray-100">
                  {course.videos.map((video) => (
                    <div key={video.videoId} className="border-b border-gray-100 last:border-b-0">
                      {/* 영상 헤더 */}
                      <button
                        onClick={() => toggleVideo(video.videoId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Film className="w-4 h-4 text-purple-600" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-gray-900">
                              {video.weekNumber}주차 - {(video.videoTitle || '').replace('.m3u8', '')}
                            </span>
                            {video.weekTitle && (
                              <span className="text-xs text-gray-500">{video.weekTitle}</span>
                            )}
                          </div>
                          <Badge 
                            count={video.noteCount}
                            className="bg-purple-100 text-purple-600 border-purple-100"
                          />
                        </div>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            expandedVideos.has(video.videoId) ? "transform rotate-180" : ""
                          )} 
                        />
                      </button>

                      {/* 노트 목록 */}
                      {expandedVideos.has(video.videoId) && (
                        <div className="p-4 space-y-3">
                          {video.notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <Button
                                    type="link"
                                    size="small"
                                    className="text-blue-600 hover:text-blue-700 p-0"
                                    onClick={() => toggleNote(note.id)}
                                  >
                                    {note.formattedTime}
                                  </Button>
                                </div>
                                <Space split={<Divider type="vertical" />}>
                                  <span className="text-xs text-gray-500">
                                    작성: {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                  {note.updatedAt !== note.createdAt && (
                                    <span className="text-xs text-gray-500">
                                      수정: {new Date(note.updatedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </Space>
                              </div>
                              <div className="mb-3">
                                <p className={cn(
                                  "text-sm text-gray-700",
                                  expandedNotes.has(note.id) ? '' : 'line-clamp-2'
                                )}>
                                  {note.content}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() => toggleNote(note.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  {expandedNotes.has(note.id) ? '접기' : '더보기'}
                                </Button>
                                <Space>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Edit2 className="w-4 h-4" />}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    수정
                                  </Button>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Trash2 className="w-4 h-4" />}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    삭제
                                  </Button>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      console.log('비디오 데이터:', { courseId: course.courseId, videoId: video.videoId, weekNumber: video.weekNumber, timestamp: note.timestamp });
                                      handleVideoClick(course.courseId, video.videoId, video.weekNumber, note.timestamp);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    동영상 보기
                                  </Button>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 과제 및 시험 항목 클릭 핸들러 함수
const useAssignmentHandlers = () => {
  const navigate = useNavigate();
  
  const handleAssignmentClick = (item: AssignmentItem) => {
    // 과제 제출 페이지로 이동 (item_id 사용)
    navigate(`/assignments/${item.item_id}`);
  };
  
  const handleExamClick = (item: AssignmentItem) => {
    // EXAM과 QUIZ 모두 퀴즈 인터페이스로 처리
    if (item.item_type === 'EXAM' || item.item_type === 'QUIZ') {
      // 파일 이름 생성
      const fileName = `${item.title || 'quiz'}.json`;
      
      console.log('시험 응시 클릭:', item);
      
      // course_id가 정의되어 있는지 확인하고, 없으면 item_id를 사용
      const courseId = item.course_id || item.item_id;
      
      // S3 객체 URL 직접 사용
      navigate(`/mycourse/${courseId}/quiz/${encodeURIComponent(fileName)}`, {
        state: {
          // S3 버킷의 객체 URL 직접 사용
          quizUrl: `https://nationslablmscoursebucket.s3.ap-northeast-2.amazonaws.com/assignments/${item.item_id}/example_quiz.json`,
          title: item.title || 'Quiz',
          courseId: courseId,
          assignmentId: item.item_id
        }
      });
      
      // 콘솔에 디버그 정보 출력
      console.log('퀴즈 페이지 네비게이션:', {
        url: `/mycourse/${courseId}/quiz/${encodeURIComponent(fileName)}`,
        courseId,
        quizFileName: fileName,
        assignmentId: item.item_id
      });
    } else {
      // 일반 과제인 경우 기존 방식으로 이동
      navigate(`/assignments/${item.item_id}`);
    }
  };
  
  return { handleAssignmentClick, handleExamClick };
};

const StudentCoursesPage: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 오프라인 출석 시간 측정 훅 사용
  const {
    isTimerRunning,
    courseId: timerCourseId,
    formattedTime,
    startTimer,
    resumeTimer
  } = useAttendanceTimer();
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notices' | 'assignments' | 'qna' | 'notes' | 'posts' | 'progress'>('curriculum');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [qnaPosts, setQnaPosts] = useState<QnaPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { data: allNotes, isLoading: isLoadingNotes } = useGetAllNotesQuery();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { data: courseAssignments, isLoading: isLoadingCourseAssignments } = useGetCourseAssignmentsQuery(
    selectedCourse?.id || '', 
    { 
      skip: !selectedCourse,
      refetchOnMountOrArgChange: true
    }
  );
  const { handleAssignmentClick, handleExamClick } = useAssignmentHandlers();

  // 사용자의 등록 상태가 "DROPPED"인지 확인
  const isEnrollmentDropped = useMemo(() => {
    return selectedCourse?.enrollment_status === "DROPPED";
  }, [selectedCourse]);

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
        
        // URL에서 courseId가 있으면 해당 과목 선택
        if (courseId) {
          const course = fetchedCourses.find(c => c.id === courseId);
          if (course) {
            setSelectedCourse(course);
          } else if (fetchedCourses.length > 0) {
            // courseId가 유효하지 않으면 첫 번째 과목 선택 및 URL 업데이트
            setSelectedCourse(fetchedCourses[0]);
            navigate(`/mycourse/${fetchedCourses[0].id}`, { replace: true });
          }
        } else if (fetchedCourses.length > 0) {
          // courseId가 없으면 첫 번째 과목 선택 및 URL 업데이트
          setSelectedCourse(fetchedCourses[0]);
          navigate(`/mycourse/${fetchedCourses[0].id}`, { replace: true });
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
  }, [navigate, courseId]);

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

  const handleFileClick = async (downloadUrl: string | null, fileName: string, streamingUrl?: string | null, weekNumber?: number) => {
    // 주차 정보가 없는 경우 처리
    if (!weekNumber) {
      sonnerToast.error('주차 정보를 찾을 수 없습니다.');
      return;
    }

    // 퀴즈 파일인 경우
    if (fileName.endsWith('.json')) {
      navigate(`/mycourse/${selectedCourse?.id}/quiz/${encodeURIComponent(fileName)}`, {
        state: {
          quizUrl: downloadUrl,
          title: fileName.replace('.json', ''),
          courseId: selectedCourse?.id,
          weekId: weekNumber.toString()
        }
      });
      return;
    }

    // 비디오 파일인 경우
    if (fileName.endsWith('.m3u8')) {
      const videoUrl = streamingUrl || downloadUrl;
      if (!videoUrl) {
        sonnerToast.error('비디오 URL이 유효하지 않습니다.');
        return;
      }
      navigate(`/mycourse/${selectedCourse?.id}/week/${weekNumber}/video/${encodeURIComponent(fileName)}`, {
        state: {
          videoUrl,
          title: fileName.replace('.m3u8', ''),
          courseId: selectedCourse?.id,
          weekNumber: weekNumber,
          weekTitle: `${weekNumber}주차 강의`
        }
      });
      return;
    }

    // 일반 파일은 다운로드 - 유틸리티 함수 사용
    if (!downloadUrl) {
      sonnerToast.error('다운로드 URL이 유효하지 않습니다.');
      return;
    }

    await downloadFile(downloadUrl, {
      fileName,
      onError: (error) => {
        console.error('파일 다운로드 실패:', error);
      }
    });
  };

  // 게시판 데이터 로딩
  useEffect(() => {
    const fetchBoardData = async () => {
      if (!selectedCourse) return;
      
      setBoardLoading(true);
      try {
        const [noticeList, postList, qnaList] = await Promise.all([
          getNotices({ courseId: selectedCourse.id }),
          getCommunityPosts({ courseId: selectedCourse.id }),
          getQnaPosts({ courseId: selectedCourse.id })
        ]);

        // 모든 게시물 표시
        setNotices(noticeList);
        setCommunityPosts(postList);
        setQnaPosts(qnaList);
      } catch (error) {
        console.error('게시판 데이터 로딩 실패:', error);
        sonnerToast.error('게시판 데이터를 불러오는데 실패했습니다.');
      } finally {
        setBoardLoading(false);
      }
    };

    if (activeTab === 'notices' || activeTab === 'posts' || activeTab === 'qna') {
      fetchBoardData();
    }
  }, [selectedCourse, activeTab]);

  const handleVideoClick = (courseId: string, videoId: string, weekNumber: number, timestamp: number) => {
    if (!weekNumber) {
      console.error('주차 정보가 없습니다:', { courseId, videoId, weekNumber, timestamp });
      sonnerToast.error('동영상을 재생할 수 없습니다. 주차 정보가 없습니다.');
      return;
    }

    navigate(`/mycourse/${courseId}/week/${weekNumber}/video/${encodeURIComponent(videoId)}`, {
      state: {
        videoUrl: `${getApiUrl('')}/videos/${courseId}/${weekNumber}/${videoId}`,
        title: videoId.replace('.m3u8', ''),
        courseId,
        timestamp,
        weekNumber,
        weekTitle: `${weekNumber}주차 강의`
      }
    });
  };

  const renderNotesPanel = () => {
    return <NotesPanel />;
  };

  // 과제 및 시험 탭 렌더링
  const renderAssignmentsTab = () => {
    if (isLoadingCourseAssignments) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (!courseAssignments || courseAssignments.length === 0) {
      return (
        <Empty
          image={<FileText className="w-12 h-12 text-gray-300" />}
          description={`${selectedCourse?.title || '현재 과목'}에 등록된 과제 및 시험이 없습니다.`}
        />
      );
    }
    
    // 백엔드 API 결과 구조에 맞게 데이터 변환 및 course_id 확인
    const currentCourseId = selectedCourse?.id || '';
    
    // 각 항목에 course_id가 없는 경우 현재 선택된 과목의 ID를 할당
    const processedAssignments = courseAssignments.map(item => ({
      ...item,
      course_id: item.course_id || currentCourseId
    }));
    
    const pendingAssignments = processedAssignments.filter(a => a.status === '진행중' && a.item_type === 'ASSIGNMENT') as AssignmentItem[];
    const overdueAssignments = processedAssignments.filter(a => a.status === '마감됨' && !a.is_completed && a.item_type === 'ASSIGNMENT') as AssignmentItem[];
    const completedAssignments = processedAssignments.filter(a => a.is_completed && a.item_type === 'ASSIGNMENT') as AssignmentItem[];
    
    const pendingExams = processedAssignments.filter(a => a.status === '진행중' && (a.item_type === 'EXAM' || a.item_type === 'QUIZ')) as AssignmentItem[];
    const overdueExams = processedAssignments.filter(a => a.status === '마감됨' && !a.is_completed && (a.item_type === 'EXAM' || a.item_type === 'QUIZ')) as AssignmentItem[];
    const completedExams = processedAssignments.filter(a => a.is_completed && (a.item_type === 'EXAM' || a.item_type === 'QUIZ')) as AssignmentItem[];

    // 과제 및 시험 항목 개수 계산
    const totalAssignments = pendingAssignments.length + overdueAssignments.length + completedAssignments.length;
    const totalExams = pendingExams.length + overdueExams.length + completedExams.length;
    
    return (
      <Card className="rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="mb-0">{selectedCourse?.title} 과제 및 시험</Title>
          <Space>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">전체 보기</Select.Option>
              <Select.Option value="pending">미제출</Select.Option>
              <Select.Option value="overdue">기한 초과</Select.Option>
              <Select.Option value="completed">완료</Select.Option>
            </Select>
          </Space>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
            <Statistic
              title={<span className="text-orange-600 font-medium">미제출 항목</span>}
              value={pendingAssignments.length + pendingExams.length}
              suffix="개"
              prefix={<AlertCircle className="w-4 h-4 text-orange-600" />}
              valueStyle={{ color: '#ea580c' }}
            />
            <div className="mt-2">
              <Tag color="orange">마감 임박</Tag>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50">
            <Statistic
              title={<span className="text-red-600 font-medium">기한 초과</span>}
              value={overdueAssignments.length + overdueExams.length}
              suffix="개"
              prefix={<Clock className="w-4 h-4 text-red-600" />}
              valueStyle={{ color: '#dc2626' }}
            />
            <div className="mt-2">
              <Tag color="error">제출 필요</Tag>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
            <Statistic
              title={<span className="text-green-600 font-medium">완료 항목</span>}
              value={completedAssignments.length + completedExams.length}
              suffix="개"
              prefix={<FileText className="w-4 h-4 text-green-600" />}
              valueStyle={{ color: '#16a34a' }}
            />
            <div className="mt-2">
              <Tag color="success">제출 완료</Tag>
            </div>
          </Card>
        </div>

        <Tabs defaultActiveKey="assignments">
          <Tabs.TabPane 
            tab={
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                과제 
                <Badge count={pendingAssignments.length + overdueAssignments.length} offset={[5, 0]} style={{ marginLeft: 8 }} />
              </span>
            } 
            key="assignments"
          >
            {pendingAssignments.length === 0 && overdueAssignments.length === 0 && completedAssignments.length === 0 ? (
              <Empty description="등록된 과제가 없습니다." />
            ) : (
              <>
                {pendingAssignments.length > 0 && (
                  <>
                    <Divider orientation="left">진행 중인 과제</Divider>
                    <List
                      dataSource={pendingAssignments}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button 
                              type="primary"
                              onClick={() => handleAssignmentClick(item)}
                            >
                              과제 제출
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}

                {overdueAssignments.length > 0 && (
                  <>
                    <Divider orientation="left">기한 초과 과제</Divider>
                    <List
                      dataSource={overdueAssignments}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button 
                              type="primary" 
                              danger
                              onClick={() => handleAssignmentClick(item)}
                            >
                              지금 제출
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color="red">기한 초과</Tag>
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>제출일: {item.submission_date ? new Date(item.submission_date).toLocaleDateString('ko-KR') + ' ' + new Date(item.submission_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '정보 없음'}</span>
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}

                {completedAssignments.length > 0 && (
                  <>
                    <Divider orientation="left">완료된 과제</Divider>
                    <List
                      dataSource={completedAssignments}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button
                              onClick={() => handleAssignmentClick(item)}
                            >
                              제출물 보기
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-green-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                {item.score !== undefined && (
                                  <Tag color="green">{item.score}/{item.max_score || 100}점</Tag>
                                )}
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>제출일: {item.submission_date ? new Date(item.submission_date).toLocaleDateString('ko-KR') + ' ' + new Date(item.submission_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '정보 없음'}</span>
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane 
            tab={
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                시험/퀴즈
                <Badge count={pendingExams.length + overdueExams.length} offset={[5, 0]} style={{ marginLeft: 8 }} />
              </span>
            } 
            key="exams"
          >
            {pendingExams.length === 0 && overdueExams.length === 0 && completedExams.length === 0 ? (
              <Empty description="등록된 시험/퀴즈가 없습니다." />
            ) : (
              <>
                {pendingExams.length > 0 && (
                  <>
                    <Divider orientation="left">진행 중인 시험/퀴즈</Divider>
                    <List
                      dataSource={pendingExams}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button 
                              type="primary"
                              onClick={() => handleExamClick(item)}
                            >
                              시험 응시
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}

                {overdueExams.length > 0 && (
                  <>
                    <Divider orientation="left">기한 초과 시험/퀴즈</Divider>
                    <List
                      dataSource={overdueExams}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button 
                              type="primary" 
                              danger
                              onClick={() => handleExamClick(item)}
                            >
                              지금 응시
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color="red">기한 초과</Tag>
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}

                {completedExams.length > 0 && (
                  <>
                    <Divider orientation="left">완료된 시험/퀴즈</Divider>
                    <List
                      dataSource={completedExams}
                      renderItem={(item) => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button
                              onClick={() => handleExamClick(item)}
                            >
                              결과 보기
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-green-600" />
                              </div>
                            }
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                {item.score !== undefined && (
                                  <Tag color="green">{item.score}/{item.max_score || 100}점</Tag>
                                )}
                                <Tag color="blue">{item.course_title}</Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" className="w-full">
                                <Text>{item.description || '설명 없음'}</Text>
                                <Space className="text-xs text-gray-500">
                                  <span>응시일: {item.submission_date ? new Date(item.submission_date).toLocaleDateString('ko-KR') + ' ' + new Date(item.submission_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '정보 없음'}</span>
                                  <span>마감일: {new Date(item.due_date).toLocaleDateString('ko-KR')} {new Date(item.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{item.week_number}주차</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </>
                )}
              </>
            )}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    );
  };

  // 과목 선택 핸들러
  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      navigate(`/mycourse/${courseId}`, { replace: true });
      
      // 오프라인 수업일 경우 타이머 시작
      if (course.classmode === 'OFFLINE') {
        // 이미 동일한 과목에 대한 타이머가 실행 중이면 재개
        if (isTimerRunning && timerCourseId === courseId) {
          resumeTimer();
        } else {
          // 새로운 타이머 시작
          startTimer(courseId);
        }
      }
      
      console.log(`과목 선택: ${course.title} (ID: ${course.id})`);
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

  // 파일 크기 포맷팅 함수를 새로 작성
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    return result;
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
                {/* PDF 파일인 경우 드롭다운 메뉴 제공 */}
                {item.fileName.toLowerCase().endsWith('.pdf') ? (
                  <Dropdown
                    overlay={
                      <Menu
                        onClick={({ key }) => {
                          if (key === 'webview') {
                            // PDF 뷰어 모달로 열기
                            if (item.downloadUrl) {
                              setSelectedPdf({
                                url: item.downloadUrl,
                                title: item.fileName
                              });
                              setPdfViewerOpen(true);
                            } else {
                              sonnerToast.error('PDF URL이 유효하지 않습니다.');
                            }
                          } else if (key === 'download') {
                            // PDF 다운로드
                            handleFileClick(item.downloadUrl, item.fileName, item.streamingUrl, weekNumber);
                          }
                        }}
                      >
                        <Menu.Item key="webview" icon={<Play className="w-4 h-4" />}>
                          웹에서 보기
                        </Menu.Item>
                        <Menu.Item key="download" icon={<Download className="w-4 h-4" />}>
                          다운로드
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                    disabled={!item.downloadable}
                  >
                    <button
                      className={cn(
                        "w-full flex items-center p-2 rounded-lg group",
                        item.downloadable 
                          ? "hover:bg-gray-50 cursor-pointer" 
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
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs",
                          item.downloadable ? "text-gray-500" : "text-gray-400"
                        )}>
                          {formatFileSize(item.size)}
                        </span>
                        {item.downloadable && (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                  </Dropdown>
                ) : (
                  /* 일반 파일은 기존 방식 */
                  <button
                    onClick={() => handleFileClick(item.downloadUrl, item.fileName, item.streamingUrl, weekNumber)}
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
                )}
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
    <>
    <Layout className="min-h-screen bg-gray-50">
      <Content className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert
            message="오류 발생"
            description={error}
            type="error"
            showIcon
            className="mb-8"
          />
        ) : isEnrollmentDropped ? (
          <>
            {(() => {
              // 컴포넌트 첫 렌더링 시에만 토스트 표시
              if (!toast.isActive("enrollment-dropped")) {
                toast.error(
                  <div className="flex flex-col">
                    <div className="text-xl font-bold mb-2">수강 정지됨</div>
                    <div className="text-base leading-6 whitespace-pre-line">
                      이 강의에 대한 수강이 중단되었습니다.
                      자세한 내용은 관리자에게 문의하세요.
                    </div>
                  </div>, 
                  {
                    autoClose: false,
                    position: "top-center",
                    toastId: "enrollment-dropped",
                    className: "enrollment-dropped-toast",
                    style: { 
                      background: '#fff',
                      color: '#333',
                      borderLeft: '5px solid #ef4444',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      minWidth: '360px'
                    },
                    icon: <AlertCircle className="w-8 h-8 text-red-500" />
                  }
                );
              }
              return null;
            })()}
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md border border-gray-100">
                <AlertTriangle className="w-24 h-24 mx-auto text-yellow-500 mb-8" />
                <h2 className="text-2xl font-bold text-gray-800 mb-6">수강 정지됨</h2>
                <p className="text-lg text-gray-600 mb-8 leading-7 whitespace-pre-line">
                  이 강의에 대한 수강이 중단되었습니다.
                  자세한 내용은 관리자에게 문의하세요.
                </p>
                <Button 
                  type="primary" 
                  size="large"
                  className="px-10 h-12 text-base"
                  onClick={() => {
                    toast.dismiss("enrollment-dropped");
                    navigate('/');
                  }}
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* OFFLINE 모드 타이머 표시 */}
            {selectedCourse?.classmode === 'OFFLINE' && 
             isTimerRunning && 
             timerCourseId === selectedCourse?.id && (
              <Card className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-800">
                        출석 시간 측정 중
                      </div>
                      <div className="text-sm text-green-600">
                        {selectedCourse?.title} - 오프라인 수업
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-700 font-mono">
                      {formattedTime}
                    </div>
                    <div className="text-sm text-green-600">
                      현재 웹사이트 상주 시간
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* 강의 선택 헤더 */}
            <Card className="mb-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
                <Space size="large" className="flex-1">
                  {/* <Select
                    style={{ width: 300 }}
                    value={selectedCourse?.id}
                    onChange={handleCourseSelect}
                    optionLabelProp="label"
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                      </div>
                    )}
                  onDropdownVisibleChange={(visible: boolean) => setIsDropdownOpen(visible)}
                > */}
                  {/* <Button type="primary" className="mr-2">
                    <Space>
                      {selectedCourse?.title || '과목 선택'}
                      <ChevronDown className="w-4 h-4" />
                    </Space>
                  </Button> */}
                    
                  {/* {courses.map(course => (
                    <Select.Option key={course.id} value={course.id} label={course.title}>
                      <Space>
                        <div>
                          {course.title}
                        </div>
                      </Space>
                    </Select.Option>
                  ))} */}
                  {/* </Select> */}

                  <Space className="ml-4">
                    <Tag color="blue" className="px-3 py-1 text-sm">
                      {selectedCourse?.main_category_id && Object.keys(CATEGORY_MAPPING).includes(selectedCourse.main_category_id) 
                      ? CATEGORY_MAPPING[selectedCourse.main_category_id as keyof typeof CATEGORY_MAPPING] 
                      : '지정되지 않음'}
                    </Tag>
                    <Tag
                      color={
                        selectedCourse?.classmode === 'ONLINE'
                          ? 'green'
                          : selectedCourse?.classmode === 'VOD'
                          ? 'orange'
                          : 'default'
                      }
                      className="px-3 py-1 text-sm"
                    >
                      {selectedCourse?.classmode === 'ONLINE'
                        ? '실시간 강의'
                        : selectedCourse?.classmode === 'VOD'
                        ? 'VOD 강의'
                        : '오프라인 강의'}
                    </Tag>
                    <Tag color="purple" className="px-3 py-1 text-sm">
                      {selectedCourse?.level === 'BEGINNER' ? '입문' : 
                       selectedCourse?.level === 'INTERMEDIATE' ? '중급' : '고급'}
                    </Tag>
                  </Space>
                </Space>

                {selectedCourse?.classmode === 'ONLINE' && selectedCourse?.zoom_link && (
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlayCircle className="w-5 h-5" />}
                    href={selectedCourse.zoom_link}
                    target="_blank"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl transition-all"
                  >
                    실시간 수업 입장
                  </Button>
                )}
              </div>

              <Divider className="my-0" />

              <div className="px-6 py-4 bg-gray-50/50">
                <Space size="large" className="text-gray-600">
                  <Space>
                    <User className="w-4 h-4" />
                    <Text>{selectedCourse?.instructor_name}</Text>
                  </Space>
                  <Space>
                    <Calendar className="w-4 h-4" />
                    <Text>{new Date(selectedCourse?.created_at || '').toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</Text>
                  </Space>
                  <Space>
                    <BookOpen className="w-4 h-4" />
                    <Text>{selectedCourse?.weeks?.length || 0}주차</Text>
                  </Space>
                  <Space>
                    <BarChart className="w-4 h-4" />
                    <Text>전체 진도율: {selectedCourse?.progress || 0}%</Text>
                  </Space>
                </Space>
              </div>
            </Card>

            <div className="flex gap-8">
              {/* 왼쪽 사이드바 */}
              <Sider width={240} theme="light" className="rounded-xl">
                <Menu
                  mode="vertical"
                  selectedKeys={[activeTab]}
                  onClick={({ key }) => setActiveTab(key as any)}
                  items={[
                    {
                      key: 'curriculum',
                      icon: <BookOpen className="w-5 h-5" />,
                      label: '커리큘럼'
                    },
                    {
                      key: 'progress',
                      icon: <BarChart className="w-5 h-5" />,
                      label: '학습 현황'
                    },
                    {
                      key: 'notes',
                      icon: <PenLine className="w-5 h-5" />,
                      label: '강의 노트'
                    },
                    {
                      key: 'posts',
                      icon: <MessageSquare className="w-5 h-5" />,
                      label: '게시글'
                    },
                    {
                      key: 'notices',
                      icon: <Bell className="w-5 h-5" />,
                      label: <Badge count="N" offset={[10, 0]}>공지사항</Badge>
                    },
                    {
                      key: 'assignments',
                      icon: <FileText className="w-5 h-5" />,
                      label: <Badge count={2} offset={[10, 0]}>과제</Badge>
                    },
                    {
                      key: 'qna',
                      icon: <HelpCircle className="w-5 h-5" />,
                      label: <Badge count={1} offset={[10, 0]}>질의응답</Badge>
                    }
                  ]}
                />
              </Sider>

              {/* 메인 콘텐츠 */}
              <Content className="flex-1">
                {activeTab === 'curriculum' && (
                  <Collapse 
                    className="bg-white rounded-xl"
                    expandIconPosition="end"
                    activeKey={openWeeks}
                    onChange={(keys) => handleWeekToggle(keys as string[])}
                  >
                    {selectedCourse?.weeks && selectedCourse.weeks.length > 0 ? (() => {
                      const weekMap = new Map();
                      
                      // 유효한 주차만 필터링
                      selectedCourse.weeks
                        .filter(week => week && typeof week.weekNumber === 'number' && week.weekNumber > 0)
                        .forEach(week => {
                          // 각 주차별 자료 개수 계산
                          const materialsCount = Object.values(week.materials || {})
                            .reduce((total, materials) => total + materials.length, 0);
                            
                          // 이미 해당 주차가 있고, 현재 주차의 자료 개수가 더 많으면 교체
                          // 없으면 새로 추가
                          if (!weekMap.has(week.weekNumber) || 
                              materialsCount > weekMap.get(week.weekNumber).materialsCount) {
                            weekMap.set(week.weekNumber, { week, materialsCount });
                          }
                        });
                      
                      // 주차 번호 순서대로 정렬하여 반환
                      return Array.from(weekMap.values())
                        .sort((a, b) => a.week.weekNumber - b.week.weekNumber)
                        .map(({ week }) => (
                          <Panel
                            key={week.weekNumber.toString()}
                            header={
                              <Space>
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {week.weekNumber}
                                  </span>
                                </div>
                                <div>
                                  <Title level={5} className="mb-0">
                                    {week.weekNumber}주차
                                  </Title>
                                  <Text type="secondary">
                                    {Object.values(week.materials || {}).flat().length}개의 학습 자료
                                  </Text>
                                </div>
                              </Space>
                            }
                          >
                            {renderWeekMaterials(week.materials || {}, week.weekNumber)}
                          </Panel>
                        ));
                    })() : (
                      <Empty description="이용 가능한 주차 정보가 없습니다." />
                    )}
                  </Collapse>
                )}

                {activeTab === 'notices' && (
                  <Card className="rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <Title level={4} className="mb-0">공지사항</Title>
                    </div>
                    {boardLoading ? (
                      <div className="text-center py-8">
                        <Spin size="large" />
                      </div>
                    ) : notices.length === 0 ? (
                      <Empty
                        image={<Bell className="w-12 h-12 text-gray-300" />}
                        description="등록된 공지사항이 없습니다."
                      />
                    ) : (
                      <List
                        dataSource={notices}
                        renderItem={(notice) => (
                          <List.Item
                            key={notice.metadata.id}
                            className="cursor-pointer hover:bg-gray-50 rounded-lg p-4"
                            onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  {notice.metadata.isImportant && (
                                    <Tag color="red">중요</Tag>
                                  )}
                                  <Text strong>{notice.content.title}</Text>
                                </Space>
                              }
                              description={
                                <div>
                                  <Paragraph className="mb-2" ellipsis={{ rows: 2 }}>
                                    {notice.content.summary}
                                  </Paragraph>
                                  <Space className="text-gray-500">
                                    <Text>{notice.metadata.author}</Text>
                                    <Text>
                                      {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
                                    </Text>
                                  </Space>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                )}

                {activeTab === 'progress' && (
                  <Card className="rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                      <Title level={4} className="mb-0">학습 현황</Title>
                      <Space>
                        <Button icon={<Download className="w-4 h-4" />}>
                          학습 리포트 다운로드
                        </Button>
                        <Button type="primary" icon={<BarChart2 className="w-4 h-4" />}>
                          상세 분석
                        </Button>
                      </Space>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
                        <Statistic
                          title={<span className="text-blue-600 font-medium">전체 진도율</span>}
                          value={75}
                          suffix="%"
                          prefix={<BarChart2 className="w-4 h-4 text-blue-600" />}
                          valueStyle={{ color: '#2563eb' }}
                        />
                        <Progress percent={75} status="active" strokeColor="#2563eb" />
                        <Text className="text-sm text-blue-600 mt-2">
                          최근 학습: 2주차 - AWS EC2 인스턴스 생성
                        </Text>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
                        <Statistic
                          title={<span className="text-green-600 font-medium">과제 완료율</span>}
                          value={80}
                          suffix="%"
                          prefix={<FileText className="w-4 h-4 text-green-600" />}
                          valueStyle={{ color: '#16a34a' }}
                        />
                        <Progress percent={80} status="success" strokeColor="#16a34a" />
                        <Text className="text-sm text-green-600 mt-2">
                          8/10 과제 완료
                        </Text>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50">
                        <Statistic
                          title={<span className="text-purple-600 font-medium">퀴즈 평균</span>}
                          value={92}
                          suffix="점"
                          prefix={<BrainCircuit className="w-4 h-4 text-purple-600" />}
                          valueStyle={{ color: '#9333ea' }}
                        />
                        <Progress percent={92} status="active" strokeColor="#9333ea" />
                        <Text className="text-sm text-purple-600 mt-2">
                          총 5개 퀴즈 완료
                        </Text>
                      </Card>
                    </div>

                    <Divider orientation="left">주차별 학습 현황</Divider>
                    <List
                      dataSource={selectedCourse?.weeks || []}
                      renderItem={(week) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <span className="text-lg font-semibold text-blue-600">
                                  {week.weekNumber}
                                </span>
                              </div>
                            }
                            title={`${week.weekNumber}주차`}
                            description={
                              <Space direction="vertical" className="w-full">
                                <Progress percent={85} size="small" />
                                <Space className="text-xs text-gray-500">
                                  <span>동영상 3/4</span>
                                  <span>퀴즈 2/2</span>
                                  <span>과제 1/1</span>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                )}

                {activeTab === 'notes' && (
                  <div className="p-6">
                    {renderNotesPanel()}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  renderAssignmentsTab()
                )}

                {activeTab === 'posts' && (
                  <Card className="rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <Title level={4} className="mb-0">게시글</Title>
                      <Button 
                        type="primary" 
                        icon={<PenLine className="w-4 h-4" />}
                        onClick={() => navigate('/community/create')}
                      >
                        글쓰기
                      </Button>
                    </div>
                    {boardLoading ? (
                      <div className="text-center py-8">
                        <Spin size="large" />
                      </div>
                    ) : communityPosts.length === 0 ? (
                      <Empty
                        image={<MessageSquare className="w-12 h-12 text-gray-300" />}
                        description="등록된 게시글이 없습니다."
                      />
                    ) : (
                      <List
                        dataSource={communityPosts}
                        renderItem={(post) => (
                          <List.Item
                            key={post.metadata.id}
                            className="cursor-pointer hover:bg-gray-50 rounded-lg p-4"
                            onClick={() => navigate(`/community/${post.metadata.id}`)}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Text strong>{post.content.title}</Text>
                                </Space>
                              }
                              description={
                                <div>
                                  <Paragraph className="mb-2" ellipsis={{ rows: 2 }}>
                                    {post.content.summary}
                                  </Paragraph>
                                  <Space className="text-gray-500">
                                    <Text>{post.metadata.author}</Text>
                                    <Text>
                                      {new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}
                                    </Text>
                                    <Text>댓글 {post.metadata.commentCount}</Text>
                                  </Space>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                )}

                {activeTab === 'qna' && (
                  <Card className="rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <Title level={4} className="mb-0">질의응답</Title>
                      <Button 
                        type="primary" 
                        icon={<PenLine className="w-4 h-4" />}
                        onClick={() => navigate('/qna/create')}
                      >
                        질문하기
                      </Button>
                    </div>
                    {boardLoading ? (
                      <div className="text-center py-8">
                        <Spin size="large" />
                      </div>
                    ) : qnaPosts.length === 0 ? (
                      <Empty
                        image={<HelpCircle className="w-12 h-12 text-gray-300" />}
                        description="등록된 질문이 없습니다."
                      />
                    ) : (
                      <List
                        dataSource={qnaPosts}
                        renderItem={(post) => (
                          <List.Item
                            key={post.metadata.id}
                            className="cursor-pointer hover:bg-gray-50 rounded-lg p-4"
                            onClick={() => navigate(`/qna/${post.metadata.id}`)}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  <Tag color={post.metadata.status === 'resolved' ? 'success' : 'warning'}>
                                    {post.metadata.status === 'resolved' ? '답변완료' : '답변대기'}
                                  </Tag>
                                  <Text strong>{post.content.title}</Text>
                                </Space>
                              }
                              description={
                                <div>
                                  <Paragraph className="mb-2" ellipsis={{ rows: 2 }}>
                                    {post.content.summary}
                                  </Paragraph>
                                  <Space className="text-gray-500">
                                    <Text>{post.metadata.author}</Text>
                                    <Text>
                                      {new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}
                                    </Text>
                                    <Text>답변 {post.metadata.commentCount}</Text>
                                  </Space>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                )}
              </Content>
            </div>
          </>
        )}
      </Content>
    </Layout>

    {/* PDF 뷰어 모달 */}
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span>{selectedPdf?.title || 'PDF 문서'}</span>
        </div>
      }
      open={pdfViewerOpen}
      onCancel={() => {
        setPdfViewerOpen(false);
        setSelectedPdf(null);
      }}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ height: '80vh', padding: 0 }}
      footer={[
        <Button 
          key="download" 
          icon={<Download className="w-4 h-4" />}
          onClick={() => {
            if (selectedPdf?.url && selectedPdf?.title) {
              const link = document.createElement('a');
              link.href = selectedPdf.url;
              link.download = selectedPdf.title;
              link.click();
            }
          }}
        >
          다운로드
        </Button>,
        <Button 
          key="close" 
          onClick={() => {
            setPdfViewerOpen(false);
            setSelectedPdf(null);
          }}
        >
          닫기
        </Button>
      ]}
    >
      {selectedPdf?.url && (
        <div className="w-full h-full">
          {/* Google Docs Viewer를 통한 PDF 임베딩 */}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPdf.url)}&embedded=true`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 'none' }}
            title={`PDF Viewer - ${selectedPdf.title || 'PDF 문서'}`}
          />
        </div>
      )}
    </Modal>
    </>
  );
};

export default StudentCoursesPage; 