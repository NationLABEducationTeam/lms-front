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
  File as FileIcon,
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
  PenTool,
  X,
  Video,
  FileSpreadsheet,
  FileCode,
  ClipboardList,
  GraduationCap,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { useGetCourseByIdQuery, useCreateWeekMutation, useGetUploadUrlsMutation, useGetDownloadUrlMutation, useUpdateMaterialPermissionMutation, useCreateGradeItemMutation, useGetGradeItemsQuery, useGetGradeItemUploadUrlsMutation, useToggleCourseStatusMutation, useGetGradeItemFilesQuery, useDeleteGradeItemMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { Progress } from '@/components/common/ui/progress';
import { WeekMaterial, Course, GradeItem, CourseStatus } from '@/types/course';
import { cn } from '@/lib/utils';
import VideoModal from '@/components/video/VideoModal';
import { CATEGORY_MAPPING, MainCategoryId } from '@/types/course';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import locale from 'antd/es/date-picker/locale/ko_KR';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/common/ui/alert-dialog';

// GradeItemFile 인터페이스 정의
interface GradeItemFile {
  name: string;
  url: string;
  size: number;
  type: string;
  lastModified?: string;
}

// 파일 타입별 아이콘 매핑
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <Image className="w-5 h-5 text-purple-500" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
      return <FileCode className="w-5 h-5 text-yellow-500" />;
    default:
      return <FileIcon className="w-5 h-5 text-gray-500" />;
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
const formatFileSize = (bytes: number): string => {
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
    deadline: undefined as string | undefined
  });
  const [evaluationFiles, setEvaluationFiles] = useState<File[]>([]);
  const [evaluationFileUploadProgress, setEvaluationFileUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedGradeItem, setSelectedGradeItem] = useState<string | null>(null);
  const [gradeItemFiles, setGradeItemFiles] = useState<File[]>([]);
  const [gradeItemFileUploadProgress, setGradeItemFileUploadProgress] = useState<{ [key: string]: number }>({});
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [createGradeItemLoading, setCreateGradeItemLoading] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: course, isLoading, error, refetch } = useGetCourseByIdQuery(id || '');
  const [createWeek] = useCreateWeekMutation();
  const [getUploadUrls] = useGetUploadUrlsMutation();
  const [getDownloadUrl] = useGetDownloadUrlMutation();
  const [updateMaterialPermission] = useUpdateMaterialPermissionMutation();
  const [createGradeItem] = useCreateGradeItemMutation();
  const [getGradeItemUploadUrls] = useGetGradeItemUploadUrlsMutation();
  const [toggleCourseStatus] = useToggleCourseStatusMutation();
  const { data: gradeItems = [], refetch: refetchGradeItems, isLoading: isLoadingGradeItems } = useGetGradeItemsQuery(id || '', {
    skip: !id || !showEvaluationItems,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });
  const { refetch: refetchGradeItemFiles } = useGetGradeItemFilesQuery(selectedGradeItem || '', { skip: !selectedGradeItem });
  const [deleteGradeItem, { isLoading: isDeleting }] = useDeleteGradeItemMutation();
  
  // 성적 항목 삭제 처리
  const handleDeleteGradeItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const result = await deleteGradeItem(itemToDelete).unwrap();
      toast.success(result.message || '성적 항목이 삭제되었습니다.');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(error.message || '성적 항목 삭제에 실패했습니다.');
    }
  };

  const openDeleteDialog = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

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
    
    // 유효한 주차만 필터링하여 다음 주차 번호 계산
    const validWeeks = course.weeks?.filter(
      week => week && typeof week.weekNumber === 'number' && week.weekNumber > 0
    ) || [];
    
    // 다음 주차 번호 계산 (현재 최대 주차 번호 + 1)
    const maxWeekNumber = validWeeks.length > 0 
      ? Math.max(...validWeeks.map(week => week.weekNumber))
      : 0;
    const nextWeekNumber = maxWeekNumber + 1;
    
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

  // 수강생 관리 페이지로 이동
  const handleNavigateToEnrollments = () => {
    navigate(`/admin/courses/${id}/enrollments`);
  };

  // 강의 상태 전환
  const handleToggleStatus = async (courseId: string) => {
    try {
      await toggleCourseStatus(courseId).unwrap();
      toast.success('강의 상태가 변경되었습니다.');
      refetch();
    } catch (error) {
      console.error('강의 상태 변경 오류:', error);
      toast.error('강의 상태 변경에 실패했습니다.');
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

  // 성적 항목 파일 선택 핸들러
  const handleEvaluationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);
      setEvaluationFiles(prev => [...prev, ...fileList]);
    }
  };

  // 성적 항목 파일 제거 핸들러
  const handleRemoveEvaluationFile = (fileName: string) => {
    setEvaluationFiles(prev => prev.filter(file => file.name !== fileName));
  };

  // 성적 항목 생성 핸들러
  const handleCreateEvaluationItem = async () => {
    // 제목이 비어있는지 확인
    if (!newEvaluationItem.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    try {
      // 퀴즈 파일 확인 (JSON 파일 여부)
      const isQuizItem = evaluationFiles.some(file => file.name.endsWith('.json'));
      
      // 파일 정보 준비
      const fileInfos = evaluationFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      // JSON 파일이 있으면 타입을 'EXAM'으로 변경 (QUIZ가 아닌 EXAM 사용)
      const itemType = isQuizItem ? 'EXAM' : newEvaluationItem.type;

      // createGradeItem API 호출
      const response = await createGradeItem({
        courseId: id!,
        type: itemType, // JSON 파일 있으면 EXAM으로 설정 (QUIZ가 아닌 EXAM 사용)
        title: newEvaluationItem.title,
        deadline: newEvaluationItem.deadline,
        files: fileInfos.length > 0 ? fileInfos : undefined
      }).unwrap();

      console.log('성적 항목 생성 응답:', response);

      // 파일 업로드 처리
      if (evaluationFiles.length > 0 && response.uploadUrls && response.uploadUrls.length > 0) {
        // 파일 업로드
        await Promise.all(
          response.uploadUrls.map(async ({ url, fileName }) => {
            const file = evaluationFiles.find(f => f.name === fileName);
            if (!file) {
              console.warn('File not found:', fileName);
              return;
            }

            console.log('Uploading file:', fileName);

            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded * 100) / event.total);
                setEvaluationFileUploadProgress(prev => ({
                  ...prev,
                  [fileName]: progress
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
      }

      // 성공 메시지 표시 (퀴즈/시험 동일 처리)
      toast.success(`${isQuizItem ? '퀴즈/시험' : '성적 항목'}이 추가되었습니다.`);
      
      // 성적 항목 목록 새로고침
      refetchGradeItems();
      
      // 폼 초기화
      setNewEvaluationItem({
        type: 'ASSIGNMENT',
        title: '',
        deadline: undefined
      });
      setEvaluationFiles([]);
      setEvaluationFileUploadProgress({});
    } catch (error) {
      console.error('성적 항목 추가 오류:', error);
      toast.error('성적 항목 추가에 실패했습니다.');
    }
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

  // 날짜 포맷 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('YYYY년 MM월 DD일');
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
              <span className="text-gray-600">카테고리: {course.main_category_id && CATEGORY_MAPPING[course.main_category_id as keyof typeof CATEGORY_MAPPING] || course.main_category_id} - {course.sub_category_id}</span>
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

  // 성적 항목에 파일 추가 모달 열기
  const handleOpenFileUploadModal = (itemId: string) => {
    setSelectedGradeItem(itemId);
    setGradeItemFiles([]);
    setGradeItemFileUploadProgress({});
    setShowFileUploadModal(true);
  };

  // 성적 항목 파일 선택 핸들러
  const handleGradeItemFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);
      setGradeItemFiles(prev => [...prev, ...fileList]);
    }
  };

  // 성적 항목 파일 제거 핸들러
  const handleRemoveGradeItemFile = (fileName: string) => {
    setGradeItemFiles(prev => prev.filter(file => file.name !== fileName));
  };

  // 성적 항목에 파일 업로드
  const handleUploadGradeItemFiles = async () => {
    if (!selectedGradeItem || gradeItemFiles.length === 0) return;

    try {
      // 파일 정보 준비
      const fileInfos = gradeItemFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      // 업로드 URL 요청
      const { urls } = await getGradeItemUploadUrls({
        itemId: selectedGradeItem,
        files: fileInfos
      }).unwrap();

      // 파일 업로드
      await Promise.all(
        urls.map(async ({ url, fileName }) => {
          const file = gradeItemFiles.find(f => f.name === fileName);
          if (!file) {
            console.warn('File not found:', fileName);
            return;
          }

          console.log('Uploading file:', fileName);

          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              setGradeItemFileUploadProgress(prev => ({
                ...prev,
                [fileName]: progress
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

      // 성공 메시지 표시
      toast.success('파일이 성공적으로 업로드되었습니다.');
      
      // 모달 닫기 및 상태 초기화
      setShowFileUploadModal(false);
      setSelectedGradeItem(null);
      setGradeItemFiles([]);
      setGradeItemFileUploadProgress({});
      
      // 성적 항목 목록 새로고침
      refetchGradeItems();
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      toast.error('파일 업로드에 실패했습니다.');
    }
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
                <CardTitle className="text-xl font-bold">과제 퀴즈 추가</CardTitle>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">제출 기한</label>
                        <DatePicker 
                          locale={locale}
                          className="w-full border border-gray-300 rounded-md"
                          placeholder="기한 선택"
                          onChange={(date) => setNewEvaluationItem({
                            ...newEvaluationItem,
                            deadline: date ? date.format('YYYY-MM-DD') : undefined
                          })}
                          value={newEvaluationItem.deadline ? dayjs(newEvaluationItem.deadline) : null}
                        />
                      </div>
                    </div>
                    
                    {/* 파일 업로드 영역 */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">파일 첨부</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            파일을 드래그하거나 클릭하여 업로드하세요
                          </p>
                          <p className="text-xs text-gray-400">
                            PDF, Word, Excel, JSON 등 (최대 10MB)
                          </p>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            id="evaluation-file-upload"
                            onChange={handleEvaluationFileChange}
                          />
                          <label
                            htmlFor="evaluation-file-upload"
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            파일 선택
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* 선택된 파일 목록 */}
                    {evaluationFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">선택된 파일</h4>
                        <div className="space-y-2">
                          {evaluationFiles.map((file) => (
                            <div key={file.name} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(file.name)}
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                              </div>
                              {evaluationFileUploadProgress[file.name] !== undefined ? (
                                <div className="w-24">
                                  <Progress value={evaluationFileUploadProgress[file.name]} className="h-1.5" />
                                  <p className="text-xs text-right mt-1">{evaluationFileUploadProgress[file.name]}%</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleRemoveEvaluationFile(file.name)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
                    {isLoadingGradeItems ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : gradeItems && gradeItems.filter(item => {
                        const itemType = item.type || item.item_type;
                        return itemType !== 'ATTENDANCE';
                      }).length > 0 ? (
                      <div className="bg-white border rounded-md overflow-hidden">
                        {/* 렌더링 중인 성적 항목 */}
                        {(() => { 
                          console.log('렌더링 중인 성적 항목:', gradeItems.filter(item => {
                            const itemType = item.type || item.item_type;
                            return itemType !== 'ATTENDANCE';
                          })); 
                          return null; 
                        })()}
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제출 기한</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from(
                              new Map(
                                gradeItems
                                  .filter(item => {
                                    const itemType = item.type || item.item_type;
                                    return itemType !== 'ATTENDANCE';
                                  })
                                  .map(item => [item.id || item.item_id, item])
                              ).values()
                            ).map((item, index) => (
                              <tr key={(item.id || item.item_id) + '-' + index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getEvaluationTypeIcon(item.type || item.item_type)}
                                    <span className="ml-2">
                                      {(item.type || item.item_type) === 'ASSIGNMENT' ? '과제' : '시험'}
                                    </span>
                                  </div>
                                </td>
                                <td 
                                  className="px-6 py-4 whitespace-nowrap cursor-pointer text-blue-600 hover:underline"
                                  onClick={() => navigate(`/admin/courses/assignments/submissions/${item.id || item.item_id}`)}
                                >
                                  {item.title || item.item_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.deadline || item.due_date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/admin/courses/assignments/submissions/${item.id || item.item_id}`)}
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                      <Users className="w-4 h-4 mr-1" />
                                      제출현황
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenFileUploadModal(item.id || item.item_id!)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Upload className="w-4 h-4 mr-1" />
                                      파일 추가
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDeleteDialog(item.id || item.item_id!)}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <Trash className="w-4 h-4 mr-1" />
                                      삭제
                                    </Button>
                                  </div>
                                </td>
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
                                <div className="flex items-center space-x-2">
                                  {getFileIcon(file.name)}
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
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

            {/* 성적 항목 파일 업로드 모달 */}
            {showFileUploadModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">성적 항목 파일 추가</h3>
                    <button
                      onClick={() => setShowFileUploadModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* 파일 업로드 영역 */}
                  <div className="mb-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          파일을 드래그하거나 클릭하여 업로드하세요
                        </p>
                        <p className="text-xs text-gray-400">
                          PDF, Word, Excel, JSON 등 (최대 10MB)
                        </p>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="grade-item-file-upload"
                          onChange={handleGradeItemFileChange}
                        />
                        <label
                          htmlFor="grade-item-file-upload"
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          파일 선택
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 선택된 파일 목록 */}
                  {gradeItemFiles.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">선택된 파일</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {gradeItemFiles.map((file) => (
                          <div key={file.name} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(file.name)}
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                            </div>
                            {gradeItemFileUploadProgress[file.name] !== undefined ? (
                              <div className="w-24">
                                <Progress value={gradeItemFileUploadProgress[file.name]} className="h-1.5" />
                                <p className="text-xs text-right mt-1">{gradeItemFileUploadProgress[file.name]}%</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRemoveGradeItemFile(file.name)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFileUploadModal(false)}
                      className="border-gray-300 text-gray-700"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleUploadGradeItemFiles}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      disabled={gradeItemFiles.length === 0}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      업로드
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 수강생 관리 및 강의 상태 섹션 */}
            <div 
              className={cn(
                "flex flex-col md:flex-row justify-between items-center w-full gap-4 mb-8",
                course.status === CourseStatus.PUBLISHED ? 'bg-emerald-50 p-4 rounded-lg' : 'bg-amber-50 p-4 rounded-lg'
              )}>
              <div className="flex items-center gap-2">
                {course.status === CourseStatus.PUBLISHED ? (
                  <Unlock className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Lock className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-medium">
                  {course.status === CourseStatus.PUBLISHED ? '활성화된 강의' : '비활성화된 강의'}
                </span>
                <span className="text-sm text-slate-500">
                  ({course.status === CourseStatus.PUBLISHED ? '학생들이 볼 수 있습니다' : '학생들에게 표시되지 않습니다'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToEnrollments}
                  className="flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  수강생 관리
                </Button>
                <Button 
                  variant={course.status === CourseStatus.PUBLISHED ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => handleToggleStatus(course.id)}
                >
                  {course.status === CourseStatus.PUBLISHED ? '비활성화' : '활성화'}
                </Button>
              </div>
            </div>

            {/* 성적 항목 삭제 대화상자 */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>성적 항목 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 이 성적 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 학생 제출물도 모두 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteGradeItem} 
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDetail; 