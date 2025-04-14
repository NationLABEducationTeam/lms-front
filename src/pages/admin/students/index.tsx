import { FC, useEffect, useState } from 'react';
import { getAllEnrollments, StudentEnrollment, EnrolledCourse } from '@/services/api/enrollments';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';
import {
  Users,
  Search,
  RefreshCw,
  BookOpen,
  Clock,
  Calendar,
  GraduationCap,
  ChevronRight,
  Filter,
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  Plus,
  Edit,
  Trash2,
  X,
  FileEdit,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/common/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/common/ui/popover';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Label } from '@/components/common/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/ui/dialog';
import { Textarea } from '@/components/common/ui/textarea';
import { toast } from 'react-toastify';
import {
  getStudentNotes,
  addStudentNote,
  updateStudentNote,
  deleteStudentNote,
  StudentNote
} from '@/services/api/enrollments';

// 진행 상태에 따른 배지 컴포넌트
const ProgressBadge: FC<{ status: string | null }> = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    'NOT_STARTED': {
      label: '시작 전',
      className: 'bg-amber-100 text-amber-700 border-amber-200 font-medium'
    },
    'IN_PROGRESS': {
      label: '진행 중',
      className: 'bg-blue-100 text-blue-700 border-blue-200 font-medium'
    },
    'COMPLETED': {
      label: '완료',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium'
    },
    'DROPPED': {
      label: '중단',
      className: 'bg-rose-100 text-rose-700 border-rose-200 font-medium'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

// 수강중인 과목 표시 컴포넌트
const EnrolledCoursesList: FC<{ courses: StudentEnrollment['enrolled_courses'] }> = ({ courses }) => {
  const activeCourses = courses.filter(course => 
    course.course_id && course.enrollment_status === 'ACTIVE'
  );

  if (activeCourses.length === 0) {
    return <span className="text-slate-500 text-sm italic">수강 중인 과목 없음</span>;
  }

  // 2개 이상의 과목이 있을 때 더보기 표시 여부
  const [showAll, setShowAll] = useState(false);
  // 기본적으로 최대 1개 과목만 표시하고 나머지는 더보기로 표시
  const visibleCourses = showAll ? activeCourses : activeCourses.slice(0, 1);
  const remainingCount = activeCourses.length - (showAll ? activeCourses.length : 1);

  // 상태 약어로 표시
  const getStatusShort = (status: string | null) => {
    if (!status) return "";
    const statusMap = {
      'NOT_STARTED': '시작전',
      'IN_PROGRESS': '진행중',
      'COMPLETED': '완료',
      'DROPPED': '중단'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 상태에 따른 색상 정의
  const getStatusColor = (status: string | null) => {
    if (!status) return '';
    const statusColors = {
      'NOT_STARTED': 'bg-amber-500',
      'IN_PROGRESS': 'bg-blue-500',
      'COMPLETED': 'bg-emerald-500',
      'DROPPED': 'bg-rose-500'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-slate-500';
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1.5">
        {visibleCourses.map((course, index) => (
          <div key={course.course_id || index} className="flex items-center bg-slate-50 rounded px-2 py-1 border border-slate-200 w-full">
            <div className="flex items-center flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(course.progress_status)} mr-2 flex-shrink-0`}></div>
              <span className="text-sm font-medium text-slate-700 truncate mr-2">
                {course.course_title}
              </span>
            </div>
            <span className={`text-xs rounded px-1.5 flex-shrink-0 whitespace-nowrap ${
              course.progress_status === 'NOT_STARTED' ? 'bg-amber-100 text-amber-800' :
              course.progress_status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              course.progress_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
              course.progress_status === 'DROPPED' ? 'bg-rose-100 text-rose-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {getStatusShort(course.progress_status)}
            </span>
          </div>
        ))}
        
        {/* 더 많은 과목이 있을 경우 +N 버튼 표시 */}
        {remainingCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(!showAll);
            }}
            className="text-blue-500 hover:text-blue-600 text-xs font-medium transition-colors"
          >
            {showAll ? '접기' : `+${remainingCount}개 더보기`}
          </button>
        )}
      </div>
      
      {/* 과목 수 표시 */}
      <div className="text-xs text-slate-500 mt-1.5">
        총 {activeCourses.length}개 과목 수강 중
      </div>
    </div>
  );
};

const StudentsPage: FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentEnrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // 필터링 상태 추가
  const [activeFilter, setActiveFilter] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [coursesFilter, setCourseFilters] = useState<{[key: string]: boolean}>({});
  const [availableCourses, setAvailableCourses] = useState<{id: string, title: string}[]>([]);

  // 노트 관련 상태 추가
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollment | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // 학생별 노트 개수를 저장하는 상태 추가
  const [studentNotesCount, setStudentNotesCount] = useState<Record<string, number>>({});
  const [loadingNotesCount, setLoadingNotesCount] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllEnrollments();
      if (response.success) {
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
        setTotalStudents(response.data.total);
        
        // 모든 과목 목록 추출
        const courseMap = new Map<string, string>();
        response.data.students.forEach(student => {
          student.enrolled_courses.forEach(course => {
            if (course.course_id && course.course_title) {
              courseMap.set(course.course_id, course.course_title);
            }
          });
        });
        
        const courses = Array.from(courseMap).map(([id, title]) => ({ id, title }));
        setAvailableCourses(courses);
        
        // 과목 필터 초기화
        const initialFilters: {[key: string]: boolean} = {};
        courses.forEach(course => {
          initialFilters[course.id] = false;
        });
        setCourseFilters(initialFilters);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // 모든 필터 적용
    let filtered = students;
    
    // 검색어 필터 적용
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.student_email.toLowerCase().includes(searchTermLower) ||
        student.student_name.toLowerCase().includes(searchTermLower)
      );
    }
    
    // 활동 상태 필터 적용
    if (activeFilter !== 'all') {
      filtered = filtered.filter(student => {
        const hasActiveCourses = student.enrolled_courses.some(
          course => course.enrollment_status === 'ACTIVE'
        );
        return activeFilter === 'active' ? hasActiveCourses : !hasActiveCourses;
      });
    }
    
    // 과목 필터 적용
    const selectedCourses = Object.entries(coursesFilter)
      .filter(([_, isSelected]) => isSelected)
      .map(([courseId]) => courseId);
    
    if (selectedCourses.length > 0) {
      filtered = filtered.filter(student => 
        student.enrolled_courses.some(course => 
          selectedCourses.includes(course.course_id)
        )
      );
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, students, activeFilter, coursesFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/admin/students/${studentId}`);
  };

  const handleCourseFilterChange = (courseId: string, checked: boolean) => {
    setCourseFilters(prev => ({
      ...prev,
      [courseId]: checked
    }));
  };
  
  const clearFilters = () => {
    setActiveFilter('all');
    const resetCourseFilters: {[key: string]: boolean} = {};
    Object.keys(coursesFilter).forEach(key => {
      resetCourseFilters[key] = false;
    });
    setCourseFilters(resetCourseFilters);
  };

  const renderTableSkeleton = () => {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-slate-200 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded mb-2" />
        ))}
      </div>
    );
  };

  // 학생 노트 조회 함수
  const fetchStudentNotes = async (studentId: string) => {
    try {
      setLoadingNotes(true);
      const response = await getStudentNotes(studentId);
      if (response.success) {
        setStudentNotes(response.data.notes);
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>학생 노트를 불러오는데 실패했습니다.</span>
          </div>
        );
      }
    } catch (error) {
      console.error('노트 조회 오류:', error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>학생 노트를 불러오는데 실패했습니다.</span>
        </div>
      );
    } finally {
      setLoadingNotes(false);
    }
  };

  // 노트 추가 함수
  const handleAddNote = async () => {
    if (!selectedStudent || !newNoteContent.trim()) return;
    
    try {
      const response = await addStudentNote(selectedStudent.cognito_user_id, {
        content: newNoteContent.trim()
      });
      
      if (response.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>노트가 추가되었습니다.</span>
          </div>
        );
        setStudentNotes(prev => [response.data.note, ...prev]);
        setNewNoteContent('');
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>노트 추가에 실패했습니다.</span>
          </div>
        );
      }
    } catch (error) {
      console.error('노트 추가 오류:', error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>노트 추가 중 오류가 발생했습니다.</span>
        </div>
      );
    }
  };

  // 노트 수정 시작
  const handleEditStart = (note: StudentNote) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  };

  // 노트 수정 취소
  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  // 노트 수정 저장
  const handleUpdateNote = async (noteId: string) => {
    if (!selectedStudent || !editNoteContent.trim()) return;
    
    try {
      const response = await updateStudentNote(
        selectedStudent.cognito_user_id,
        noteId,
        { content: editNoteContent.trim() }
      );
      
      if (response.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>노트가 수정되었습니다.</span>
          </div>
        );
        setStudentNotes(prev => 
          prev.map(note => 
            note.id === noteId ? response.data.note : note
          )
        );
        setEditingNoteId(null);
        setEditNoteContent('');
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>노트 수정에 실패했습니다.</span>
          </div>
        );
      }
    } catch (error) {
      console.error('노트 수정 오류:', error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>노트 수정 중 오류가 발생했습니다.</span>
        </div>
      );
    }
  };

  // 노트 삭제
  const handleDeleteNote = async (noteId: string) => {
    if (!selectedStudent) return;
    
    // window.confirm 대신 react-toastify의 toast.info로 변경
    toast.info(
      <div className="flex flex-col gap-2">
        <div className="font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          노트 삭제 확인
        </div>
        <p>정말로 이 노트를 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            onClick={() => toast.dismiss()}
          >
            취소
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              toast.dismiss();
              deleteNoteConfirmed(noteId);
            }}
          >
            삭제
          </Button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
        hideProgressBar: true,
        closeOnClick: false,
        draggable: false,
        className: "custom-toast-confirm",
      }
    );
  };
  
  // 노트 삭제 확인 후 실행되는 함수
  const deleteNoteConfirmed = async (noteId: string) => {
    if (!selectedStudent) return;
    
    try {
      const response = await deleteStudentNote(
        selectedStudent.cognito_user_id,
        noteId
      );
      
      if (response.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>노트가 삭제되었습니다.</span>
          </div>
        );
        setStudentNotes(prev => prev.filter(note => note.id !== noteId));
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>노트 삭제에 실패했습니다.</span>
          </div>
        );
      }
    } catch (error) {
      console.error('노트 삭제 오류:', error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>노트 삭제 중 오류가 발생했습니다.</span>
        </div>
      );
    }
  };

  // 학생 노트 다이얼로그 열기
  const openNotesDialog = (student: StudentEnrollment, e: React.MouseEvent) => {
    e.stopPropagation(); // 학생 행 클릭 이벤트 전파 방지
    setSelectedStudent(student);
    setNotesDialogOpen(true);
    fetchStudentNotes(student.cognito_user_id);
  };

  // 포맷팅 함수 추가
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (e) {
      return '날짜 정보 없음';
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { locale: ko, addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  // 모든 학생의 노트 개수 조회 함수
  const fetchAllStudentNotesCount = async (students: StudentEnrollment[]) => {
    setLoadingNotesCount(true);
    const notesCountMap: Record<string, number> = {};

    try {
      // Promise.all을 사용하여 병렬로 여러 학생의 노트 개수를 조회
      await Promise.all(
        students.map(async (student) => {
          try {
            const response = await getStudentNotes(student.cognito_user_id);
            if (response.success) {
              notesCountMap[student.cognito_user_id] = response.data.notes.length;
            }
          } catch (error) {
            console.error(`노트 조회 오류 (${student.student_name}):`, error);
            notesCountMap[student.cognito_user_id] = 0;
          }
        })
      );
      
      setStudentNotesCount(notesCountMap);
    } catch (error) {
      console.error('노트 개수 조회 오류:', error);
    } finally {
      setLoadingNotesCount(false);
    }
  };

  // 학생 목록이 로드되면 노트 개수 조회
  useEffect(() => {
    if (students.length > 0 && !loading) {
      fetchAllStudentNotesCount(students);
    }
  }, [students, loading]);

  // 노트 표시 함수 - 노트 개수에 따라 다른 아이콘과 색상 제공
  const renderNoteIndicator = (studentId: string) => {
    const notesCount = studentNotesCount[studentId] || 0;
    
    if (loadingNotesCount) {
      return (
        <div className="text-slate-300 animate-pulse">
          <Bookmark className="h-4 w-4" />
        </div>
      );
    }
    
    if (notesCount > 0) {
      return (
        <div className="text-blue-500 relative group">
          <BookmarkCheck className="h-4 w-4" />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {notesCount}
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            {notesCount}개의 노트가 있습니다
          </span>
        </div>
      );
    }
    
    return (
      <div className="text-slate-300 relative group">
        <BookmarkMinus className="h-4 w-4" />
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
          노트가 없습니다
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-600 font-medium mb-2">오류 발생</h3>
          <p className="text-red-700 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="bg-white border-red-200 text-red-600 hover:bg-red-50"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 선택된 필터 개수 계산
  const activeFilterCount = 
    (activeFilter !== 'all' ? 1 : 0) + 
    Object.values(coursesFilter).filter(isSelected => isSelected).length;

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* 헤더 섹션 */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
              수강생 관리
            </h1>
            <p className="text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              전체 수강생: <span className="font-medium text-slate-700">{totalStudents}명</span> / 표시: <span className="font-medium text-slate-700">{filteredStudents.length}명</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="이름 또는 이메일로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-200 text-slate-700 placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-medium"
                >
                  <Filter className="w-4 h-4" />
                  필터
                  {activeFilterCount > 0 && (
                    <Badge className="bg-blue-500 text-white ml-1 px-1.5 py-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 border-slate-200 shadow-lg bg-white backdrop-blur-xl backdrop-filter !opacity-100">
                <div className="space-y-4 bg-white">
                  <h3 className="font-medium text-sm text-slate-700 border-b pb-2">필터 옵션</h3>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm text-slate-500 font-medium">활동 상태</h4>
                    <div className="relative">
                      <select 
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background text-slate-700 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="all">모든 수강생</option>
                        <option value="active">현재 활동 중</option>
                        <option value="inactive">비활동</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm text-slate-500 font-medium">수강 과목</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 bg-slate-50 rounded-md p-3 border border-slate-200">
                      {availableCourses.map(course => (
                        <div key={course.id} className="flex items-center space-x-2 hover:bg-slate-100 p-1 rounded">
                          <Checkbox 
                            id={`course-${course.id}`}
                            checked={coursesFilter[course.id] || false}
                            onCheckedChange={(checked: boolean) => 
                              handleCourseFilterChange(course.id, checked)
                            }
                            className="border-slate-300 text-blue-500 focus:ring-blue-400"
                          />
                          <Label 
                            htmlFor={`course-${course.id}`}
                            className="text-sm cursor-pointer truncate text-slate-700"
                          >
                            {course.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    >
                      필터 초기화
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              variant="outline"
              className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* 노트 상태 설명 - 테이블 위에 추가 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shadow-sm">
        <h3 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
          <FileEdit className="h-4 w-4 text-blue-500" />
          노트 상태 안내
        </h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-blue-500" />
            <span className="text-slate-700">노트가 있는 학생</span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkMinus className="h-4 w-4 text-slate-300" />
            <span className="text-slate-700">노트가 없는 학생</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <BookmarkCheck className="h-4 w-4 text-blue-500" />
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                2
              </span>
            </div>
            <span className="text-slate-700">노트 개수</span>
          </div>
        </div>
      </div>

      {/* 수강생 목록 (테이블) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-4">
            {renderTableSkeleton()}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <p className="text-slate-600 font-medium">검색 결과가 없습니다</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">학생 정보</TableHead>
                <TableHead className="font-semibold text-slate-700">수강 중인 과목</TableHead>
                <TableHead className="font-semibold text-slate-700">최근 활동</TableHead>
                <TableHead className="w-[100px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                // 최근 활동 날짜 계산
                const lastActiveCourse = student.enrolled_courses
                  .filter(course => course.enrollment_status === 'ACTIVE')
                  .sort((a, b) => {
                    const dateA = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
                    const dateB = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
                    return dateB - dateA;
                  })[0];
                
                const hasActiveCourses = student.enrolled_courses.some(
                  course => course.course_id && course.enrollment_status === 'ACTIVE'
                );

                return (
                  <TableRow
                    key={student.cognito_user_id}
                    className={`hover:bg-blue-50/30 cursor-pointer border-b border-slate-100 ${
                      studentNotesCount[student.cognito_user_id] > 0 ? 'bg-blue-50/20' : ''
                    }`}
                    onClick={() => handleStudentClick(student.cognito_user_id)}
                  >
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col">
                          <div className="font-medium text-slate-900 flex items-center gap-2">
                            {student.student_name}
                            {hasActiveCourses && (
                              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            )}
                            {studentNotesCount[student.cognito_user_id] > 0 && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0 text-xs">
                                노트 {studentNotesCount[student.cognito_user_id]}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">{student.student_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EnrolledCoursesList courses={student.enrolled_courses} />
                    </TableCell>
                    <TableCell>
                      {lastActiveCourse?.last_accessed_at ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {format(new Date(lastActiveCourse.last_accessed_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm italic">활동 기록 없음</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => openNotesDialog(student, e)}
                          className={`h-8 w-8 ${
                            studentNotesCount[student.cognito_user_id] > 0
                              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {renderNoteIndicator(student.cognito_user_id)}
                        </Button>
                        <ChevronRight className="w-5 h-5 text-blue-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 학생 노트 다이얼로그 */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white border-0">
          <DialogHeader className="bg-white">
            <DialogTitle className="text-slate-900">
              {selectedStudent?.student_name} 학생 노트
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              학생에 대한 중요 정보를 기록하고 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {/* 새 노트 작성 영역 */}
          <div className="space-y-2 mt-2 bg-white">
            <Label htmlFor="new-note" className="text-slate-700">새 노트 작성</Label>
            <Textarea
              id="new-note"
              placeholder="학생에 대한 메모를 입력하세요..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[100px] bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                노트 추가
              </Button>
            </div>
          </div>

          {/* 노트 목록 */}
          <div className="space-y-4 mt-4 bg-white">
            <h4 className="font-medium text-sm border-b pb-2 text-slate-800">노트 목록</h4>
            
            {loadingNotes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : studentNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                <Bookmark className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>등록된 노트가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    {editingNoteId === note.id ? (
                      /* 노트 편집 모드 */
                      <div className="space-y-2">
                        <Textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          className="min-h-[80px] bg-white border-slate-300 text-slate-900"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditCancel}
                            className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateNote(note.id)}
                            disabled={!editNoteContent.trim() || editNoteContent === note.content}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            저장
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* 노트 보기 모드 */
                      <>
                        <div className="whitespace-pre-wrap mb-2 text-slate-800">{note.content}</div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200">
                          <div>
                            <span className="font-medium">{note.admin?.name || '관리자'}</span>
                            <span> · {formatDate(note.created_at)}</span>
                            {note.updated_at !== note.created_at && (
                              <span className="ml-1 italic">
                                (수정됨: {getRelativeTime(note.updated_at)})
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-blue-600 bg-transparent"
                              onClick={() => handleEditStart(note)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-red-600 bg-transparent"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="bg-white">
            <Button 
              variant="outline" 
              onClick={() => setNotesDialogOpen(false)}
              className="w-full sm:w-auto bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;