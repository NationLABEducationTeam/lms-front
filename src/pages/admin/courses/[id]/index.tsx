import { FC, useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { 
  Plus, 
  ArrowLeft, 
  Upload, 
  Download, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Film,
  Image,
  FileIcon,
  File,
  Link,
  Paperclip,
  Search,
  Trash2,
  Edit2,
  BookOpen,
  Users,
  Calendar,
  AlertCircle,
  BrainCircuit,
  BarChart2,
  Lock,
  Unlock,
  Award,
  BookCheck,
  PenTool
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { useGetCourseByIdQuery, useCreateWeekMutation, useGetUploadUrlsMutation, useGetDownloadUrlMutation, useUpdateMaterialPermissionMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { Progress } from '@/components/common/ui/progress';
import type { WeekMaterial, Course, GradeItem } from '@/types/course';
import { cn } from '@/lib/utils';
import VideoModal from '@/components/video/VideoModal';
import { CATEGORY_MAPPING, MainCategoryId } from '@/types/course';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// 파일 타입별 아이콘 매핑
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json':
      return <BrainCircuit className="w-5 h-5 text-purple-600" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <Film className="w-5 h-5 text-purple-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <Image className="w-5 h-5 text-blue-500" />;
    case 'doc':
    case 'docx':
      return <FileIcon className="w-5 h-5 text-blue-700" />;
    case 'xls':
    case 'xlsx':
      return <FileIcon className="w-5 h-5 text-green-600" />;
    case 'ppt':
    case 'pptx':
      return <FileIcon className="w-5 h-5 text-orange-600" />;
    case 'url':
      return <Link className="w-5 h-5 text-blue-600" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
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

// 파일 분류 함수
const categorizeFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'json') return 'quiz';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'document';
  if (['mp4', 'mov', 'avi', 'm3u8'].includes(ext || '')) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'spreadsheet';
  return 'document';  // 기본값을 'unknown'에서 'document'로 변경
};

// 파일 크기 포맷팅
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CourseDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [showGradeRules, setShowGradeRules] = useState(false);
  const [showEvaluationItems, setShowEvaluationItems] = useState(false);
  const [newEvaluationItem, setNewEvaluationItem] = useState({
    type: 'ASSIGNMENT' as 'ASSIGNMENT' | 'EXAM',
    title: '',
    max_score: 100,
    weight: 10
  });
  // 임시 성적 항목 데이터 (API 호출 대신 사용)
  const [mockGradeItems] = useState<GradeItem[]>([
    {
      id: '1',
      type: 'ASSIGNMENT',
      title: '중간 과제',
      max_score: 100,
      weight: 30
    },
    {
      id: '2',
      type: 'EXAM',
      title: '기말고사',
      max_score: 100,
      weight: 40
    }
  ]);

  const { data: course, isLoading, error, refetch } = useGetCourseByIdQuery(id || '');
  const [createWeek] = useCreateWeekMutation();
  const [getUploadUrls] = useGetUploadUrlsMutation();
  const [getDownloadUrl] = useGetDownloadUrlMutation();
  const [updateMaterialPermission] = useUpdateMaterialPermissionMutation();

  // 해시 변경 감지하여 주차 선택
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const weekNumber = parseInt(hash);
      if (!isNaN(weekNumber)) {
        setSelectedWeek(weekNumber);
      }
    }
  }, [location.hash]);

  // 토글 상태 초기화
  useEffect(() => {
    // 컴포넌트 마운트 시 토글 상태 초기화
    setShowCourseInfo(false);
    setShowGradeRules(false);
  }, [id]); // 강의 ID가 변경될 때만 실행

  // 에러 타입 가드 함수
  const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
    if (!error) return '알 수 없는 에러가 발생했습니다.';
    
    if ('status' in error) {
      // FetchBaseQueryError
      return typeof error.data === 'object' && error.data && 'message' in error.data
        ? String(error.data.message)
        : '강의 정보를 불러오는데 실패했습니다.';
    }
    
    // SerializedError
    return error.message || '강의 정보를 불러오는데 실패했습니다.';
  };

  const handleCreateWeek = async () => {
    if (!course) return;
    
    const nextWeekNumber = (course.weeks?.length || 0) + 1;
    try {
      const result = await createWeek({ courseId: id!, weekNumber: nextWeekNumber }).unwrap();
      if (result) {
        toast.success(`${nextWeekNumber}주차가 생성되었습니다.`);
        // 새로 생성된 주차로 이동
        navigate(`#${nextWeekNumber}`);
        setSelectedWeek(nextWeekNumber);
        // 데이터 새로고침
        await refetch();
        // 화면 스크롤
        setTimeout(() => {
          const element = document.getElementById(`week-${nextWeekNumber}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error: any) {
      toast.error(error.message || '주차 생성에 실패했습니다.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, weekNumber: number) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => ({
        ...prev,
        [weekNumber]: [...(prev[weekNumber] || []), ...files]
      }));
    }
  };

  const handleFileChange = (weekNumber: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setSelectedFiles(prev => ({
      ...prev,
      [weekNumber]: [...(prev[weekNumber] || []), ...Array.from(files)]
    }));
  };

  const handleUpload = async (weekNumber: number) => {
    const files = selectedFiles[weekNumber];
    if (!files || files.length === 0) return;

    try {
      const fileInfos = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        category: categorizeFile(file.name)
      }));

      console.log('Uploading files:', fileInfos);

      const { urls } = await getUploadUrls({
        courseId: id!,
        weekNumber,
        files: fileInfos
      }).unwrap();

      console.log('Got upload URLs:', urls);

      // Upload files to S3 with progress tracking
      await Promise.all(
        urls.map(async ({ url, fileName }, _index) => {
          const file = files.find(f => f.name === fileName);
          if (!file) {
            console.warn('File not found:', fileName);
            return;
          }

          console.log('Uploading file:', fileName);

          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(prev => ({
                ...prev,
                [`${weekNumber}-${fileName}`]: progress
              }));
            }
          });

          return new Promise((resolve, reject) => {
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.onload = () => {
              console.log('Upload completed for:', fileName);
              resolve(xhr.response);
            };
            xhr.onerror = () => {
              console.error('Upload failed for:', fileName);
              reject(xhr.statusText);
            };
            xhr.send(file);
          });
        })
      );

      // 업로드 성공 후 처리
      toast.success('파일 업로드가 완료되었습니다.');
      if (files.some(file => file.name.endsWith('.json'))) {
        toast.info('퀴즈 파일이 업로드되었습니다. 학생들은 퀴즈 페이지에서 이를 볼 수 있습니다.');
      }
      setSelectedFiles(prev => {
        const newState = { ...prev };
        delete newState[weekNumber];
        return newState;
      });
      setUploadProgress({});
      setShowUploadArea(null);
      
      // 데이터 새로고침
      console.log('Refreshing course data...');
      await refetch();
      console.log('Course data refreshed');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('파일 업로드에 실패했습니다.');
    }
  };

  const handleFileAction = async (downloadUrl: string | null, fileName: string, streamingUrl?: string | null) => {
    if (fileName.endsWith('.m3u8')) {
      const videoUrl = streamingUrl || downloadUrl;
      if (!videoUrl) {
        toast.error('비디오 URL이 유효하지 않습니다.');
        return;
      }
      // 모달 대신 비디오 페이지로 이동
      navigate(`/mycourse/${id}/week/${selectedWeek}/video/${encodeURIComponent(fileName)}`, {
        state: {
          videoUrl,
          title: fileName.replace('.m3u8', ''),
          courseId: id,
          weekId: selectedWeek
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
    }
  };

  const handleWeekClick = (weekNumber: number) => {
    if (selectedWeek === weekNumber) {
      setSelectedWeek(null);
      navigate(`/admin/courses/${id}`);
    } else {
      setSelectedWeek(weekNumber);
      navigate(`#${weekNumber}`);
    }
  };

  const handleUploadClick = (weekNumber: number) => {
    setShowUploadArea(showUploadArea === weekNumber ? null : weekNumber);
  };

  const handlePermissionToggle = async (weekNumber: number, fileName: string, currentPermission: boolean) => {
    try {
      // 화질별 m3u8 파일은 권한 변경 불가
      if (fileName.endsWith('.m3u8') && fileName.includes('x')) {
        toast.error('화질별 m3u8 파일의 권한은 개별적으로 변경할 수 없습니다.');
        return;
      }

      // 메인 m3u8 파일 또는 일반 파일의 권한 변경
      const response = await updateMaterialPermission({
        courseId: id!,
        weekNumber,
        fileName,
        isDownloadable: !currentPermission
      }).unwrap();
      
      if (response.success) {
        toast.success(
          fileName.endsWith('.m3u8')
            ? '비디오 파일의 권한이 변경되었습니다. (관련된 세그먼트 파일들의 권한도 함께 변경됩니다)'
            : '파일 다운로드 권한이 변경되었습니다.'
        );
      } else {
        toast.error('권한 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Permission update error:', error);
      toast.error('권한 변경에 실패했습니다.');
    }
  };

  // 성적 항목 생성 핸들러
  const handleCreateEvaluationItem = async () => {
    // API 호출 대신 토스트 메시지만 표시
    toast.info('현재 성적 항목 추가 기능은 비활성화되어 있습니다.');
    setNewEvaluationItem({
      type: 'ASSIGNMENT',
      title: '',
      max_score: 100,
      weight: 10
    });
  };
  
  // 성적 항목 타입별 아이콘
  const getEvaluationTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return <PenTool className="w-5 h-5 text-blue-500" />;
      case 'EXAM':
        return <BookCheck className="w-5 h-5 text-red-500" />;
      default:
        return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  // 파일 목록 렌더링 수정
  const renderWeekMaterials = (materials: { [key: string]: WeekMaterial[] }) => {
    console.log('Rendering materials:', materials);

    const renderMaterialList = (items: WeekMaterial[] | undefined, type: string) => {
      if (!items || items.length === 0) return null;
      
      console.log(`Rendering ${type} materials:`, items);
      
      // .ts 파일 제외 및 화질별 m3u8 파일 필터링
      const filteredItems = items.filter(item => {
        const fileName = item.fileName.toLowerCase();
        
        // .ts 파일 제외
        if (fileName.endsWith('.ts')) return false;
        
        // 화질별 m3u8 파일 제외
        if (fileName.endsWith('.m3u8') && 
            (fileName.includes('720x480') || 
             fileName.includes('1280x720') || 
             fileName.includes('1920x1080'))) {
          return false;
        }
        
        return true;
      });

      if (filteredItems.length === 0) return null;

      return (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">{getFileTypeName(type)}</h4>
          <ul className="space-y-1">
            {filteredItems.map((item, index) => (
              <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(item.fileName)}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">{item.fileName}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(item.size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePermissionToggle(selectedWeek!, item.fileName, item.downloadable ?? true)}
                    className={cn(
                      "p-2 rounded-lg transition-colors flex items-center gap-2",
                      item.downloadable 
                        ? "text-green-600 hover:bg-green-50 hover:text-green-700" 
                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    )}
                    title={item.downloadable ? "다운로드 허용됨" : "다운로드 제한됨"}
                  >
                    {item.downloadable ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span className="text-xs font-medium">허용</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-medium">제한</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleFileAction(item.downloadUrl, item.fileName, item.streamingUrl)}
                    className={cn(
                      "p-2 rounded-lg transition-colors flex items-center gap-2",
                      item.downloadable 
                        ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        : "text-gray-400 cursor-not-allowed"
                    )}
                    disabled={!item.downloadable}
                    title={
                      item.fileName.endsWith('.m3u8')
                        ? "비디오 재생"
                        : item.downloadable
                          ? "파일 다운로드"
                          : "다운로드가 제한된 파일입니다"
                    }
                  >
                    {item.fileName.endsWith('.m3u8') ? (
                      <>
                        <Film className="w-4 h-4" />
                        <span className="text-xs font-medium">재생</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">다운로드</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {renderMaterialList(materials.quiz, 'quiz')}
        {renderMaterialList(materials.document, 'document')}
        {renderMaterialList(materials.video, 'video')}
        {renderMaterialList(materials.image, 'image')}
        {renderMaterialList(materials.spreadsheet, 'spreadsheet')}
        {renderMaterialList(materials.unknown, 'unknown')}
      </div>
    );
  };

  // 강의 정보 컴포넌트
  const CourseInfoCard = () => {
    if (!course) return null;
    
    return (
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowCourseInfo(!showCourseInfo)}
        >
          <h2 className="text-lg font-semibold">강의 정보</h2>
          {showCourseInfo ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
        {showCourseInfo && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">카테고리: {CATEGORY_MAPPING[course.main_category_id as MainCategoryId]} - {course.sub_category_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">강사: {course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-gray-600">수업 방식: {course.classmode}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-600">난이도: {course.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-600">가격: {Number(course.price).toLocaleString()}원</span>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // 성적 처리 규칙 컴포넌트
  const GradeRulesCard = () => {
    if (!course) return null;
    
    return (
      <Card className="p-6 border-l-4 border-l-green-500">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowGradeRules(!showGradeRules)}
        >
          <h2 className="text-lg font-semibold">성적 처리 규칙</h2>
          {showGradeRules ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
        {showGradeRules && (
          course.grade_items ? (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 gap-4">
                {course.grade_items.map((item) => (
                  <div key={item.id} className={cn(
                    "p-4 rounded-lg",
                    item.type === 'ASSIGNMENT' ? "bg-green-50" :
                    item.type === 'ATTENDANCE' ? "bg-blue-50" :
                    "bg-purple-50"
                  )}>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      item.type === 'ASSIGNMENT' ? "text-green-700" :
                      item.type === 'ATTENDANCE' ? "text-blue-700" :
                      "text-purple-700"
                    )}>{item.title}</h3>
                    <div className="flex items-end justify-between">
                      <span className={cn(
                        "text-2xl font-bold",
                        item.type === 'ASSIGNMENT' ? "text-green-700" :
                        item.type === 'ATTENDANCE' ? "text-blue-700" :
                        "text-purple-700"
                      )}>{item.weight}%</span>
                      <span className={cn(
                        "text-sm",
                        item.type === 'ASSIGNMENT' ? "text-green-600" :
                        item.type === 'ATTENDANCE' ? "text-blue-600" :
                        "text-purple-600"
                      )}>비중</span>
                    </div>
                  </div>
                ))}
              </div>
              {course.gradeRules?.min_attendance_rate && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  ※ 최소 출석률({course.gradeRules.min_attendance_rate}%) 미달 시 성적과 관계없이 F학점이 부여됩니다.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg mt-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">성적 처리 규칙이 설정되지 않았습니다.</p>
            </div>
          )
        )}
      </Card>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            {getErrorMessage(error)}
          </div>
        ) : !course ? (
          <div className="text-center text-red-600">
            강의 정보를 찾을 수 없습니다.
          </div>
        ) : (
          <>
            {/* 헤더 섹션 */}
            <div className="flex items-center gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/courses')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
                <p className="text-gray-500 text-sm">{course.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreateWeek}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  주차 추가
                </Button>
                <Button
                  onClick={() => navigate(`/admin/courses/${id}/edit`)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  강의 수정
                </Button>
              </div>
            </div>

            {/* 강의 정보 및 성적 처리 규칙 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 강의 기본 정보 */}
              <CourseInfoCard />

              {/* 성적 처리 규칙 */}
              <GradeRulesCard />
            </div>

            {/* 성적 항목 관리 섹션 */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">성적 항목 관리</CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEvaluationItems(!showEvaluationItems)}
                  className="flex items-center gap-2"
                >
                  {showEvaluationItems ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CardHeader>
              
              {showEvaluationItems && course && (
                <CardContent className="space-y-4">
                  {/* 성적 항목 추가 폼 */}
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <h3 className="font-medium">새 성적 항목 추가</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                        <select 
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={newEvaluationItem.type}
                          onChange={(e) => setNewEvaluationItem({
                            ...newEvaluationItem,
                            type: e.target.value as 'ASSIGNMENT' | 'EXAM'
                          })}
                        >
                          <option value="ASSIGNMENT">과제</option>
                          <option value="EXAM">시험</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                        <input 
                          type="text" 
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={newEvaluationItem.title}
                          onChange={(e) => setNewEvaluationItem({
                            ...newEvaluationItem,
                            title: e.target.value
                          })}
                          placeholder="중간고사, 기말과제 등"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">최대 점수</label>
                        <input 
                          type="number" 
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={newEvaluationItem.max_score}
                          onChange={(e) => setNewEvaluationItem({
                            ...newEvaluationItem,
                            max_score: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">가중치 (%)</label>
                        <input 
                          type="number" 
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={newEvaluationItem.weight}
                          onChange={(e) => setNewEvaluationItem({
                            ...newEvaluationItem,
                            weight: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleCreateEvaluationItem}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        disabled={!newEvaluationItem.title}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        항목 추가
                      </Button>
                    </div>
                  </div>
                  
                  {/* 성적 항목 목록 */}
                  <div className="space-y-2">
                    <h3 className="font-medium">성적 항목 목록</h3>
                    {false ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : mockGradeItems && mockGradeItems.length > 0 ? (
                      <div className="bg-white border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최대 점수</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가중치 (%)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {mockGradeItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getEvaluationTypeIcon(item.type)}
                                    <span className="ml-2">
                                      {item.type === 'ASSIGNMENT' ? '과제' : '시험'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.max_score}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.weight}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 text-center text-gray-500 rounded-md">
                        등록된 성적 항목이 없습니다.
                      </div>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mt-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">현재 성적 항목 관리 기능은 개발 중입니다. 곧 사용 가능해질 예정입니다.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 주차별 자료 */}
            <div className="space-y-6">
              {course.weeks?.map((week) => (
                <Card 
                  key={week.weekNumber} 
                  className="p-6"
                  id={`week-${week.weekNumber}`}
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleWeekClick(week.weekNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">{week.weekNumber}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {week.weekNumber}주차
                        </h3>
                      </div>
                      {selectedWeek === week.weekNumber ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {selectedWeek === week.weekNumber && week && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-medium text-gray-900">수업 자료</h4>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadClick(week.weekNumber);
                          }}
                          className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 shadow-sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          파일 업로드
                        </Button>
                      </div>

                      {showUploadArea === week.weekNumber && (
                        <div 
                          className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-all duration-200 ${
                            isDragging 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, week.weekNumber)}
                        >
                          <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-gray-600 mb-3">
                              파일을 드래그하여 업로드하거나
                            </p>
                            <input
                              type="file"
                              id={`file-${week.weekNumber}`}
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileChange(week.weekNumber, e)}
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById(`file-${week.weekNumber}`)?.click()}
                              className="bg-white hover:bg-gray-50"
                            >
                              파일 선택
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedFiles[week.weekNumber]?.length > 0 && (
                        <div className="space-y-4 mb-6 bg-white p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Upload className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">업로드 대기 중인 파일</h4>
                          </div>
                          {selectedFiles[week.weekNumber].map((file) => (
                            <div key={file.name} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {getFileIcon(file.name)}
                                  <span className="text-sm text-gray-900">{file.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                              {uploadProgress[`${week.weekNumber}-${file.name}`] !== undefined && (
                                <div className="mt-2">
                                  <Progress 
                                    value={uploadProgress[`${week.weekNumber}-${file.name}`]} 
                                    className="h-1.5 bg-gray-100"
                                  />
                                  <p className="text-xs text-gray-500 mt-1 text-right">
                                    {uploadProgress[`${week.weekNumber}-${file.name}`]}%
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            onClick={() => handleUpload(week.weekNumber)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            업로드 시작
                          </Button>
                        </div>
                      )}

                      {renderWeekMaterials(week.materials || {})}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 비디오 모달 */}
            {selectedVideo && (
              <VideoModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                videoUrl={selectedVideo}
                title="강의 영상"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDetail; 