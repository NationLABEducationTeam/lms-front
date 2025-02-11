import { FC, useState, useEffect } from 'react';
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
  BrainCircuit
} from 'lucide-react';
import { Card } from '@/components/common/ui/card';
import { useGetCourseByIdQuery, useCreateWeekMutation, useGetUploadUrlsMutation, useGetDownloadUrlMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { Progress } from '@/components/common/ui/progress';
import type { WeekMaterial } from '@/types/course';
import { Course } from '@/types/course';
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
  if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'document';
  if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
  if (['xls', 'xlsx'].includes(ext || '')) return 'spreadsheet';
  return 'unknown';
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

  const { data: course, isLoading, error, refetch } = useGetCourseByIdQuery(id!);
  const [createWeek] = useCreateWeekMutation();
  const [getUploadUrls] = useGetUploadUrlsMutation();
  const [getDownloadUrl] = useGetDownloadUrlMutation();

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
        refetch();
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

  const handleDownload = async (downloadUrl: string) => {
    try {
      // 파일 다운로드 처리
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // URL에서 파일 이름 추출
      const fileName = downloadUrl.split('/').pop() || 'download';
      a.download = decodeURIComponent(fileName);
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

  // 파일 목록 렌더링 수정
  const renderWeekMaterials = (materials: { [key: string]: WeekMaterial[] }) => {
    console.log('Rendering materials:', materials);

    const renderMaterialList = (items: WeekMaterial[] | undefined, type: string) => {
      if (!items || items.length === 0) return null;
      
      console.log(`Rendering ${type} materials:`, items);
      
      return (
        <div className={`mb-6 last:mb-0 ${type === 'quiz' ? 'bg-purple-50 p-4 rounded-lg border border-purple-100' : ''}`}>
          <h4 className={`text-sm font-medium mb-2 ${type === 'quiz' ? 'text-purple-700' : 'text-slate-500'}`}>
            {getFileTypeName(type)}
            {type === 'quiz' && (
              <span className="ml-2 text-xs text-purple-600">
                (학생들에게 퀴즈 페이지로 표시됩니다)
              </span>
            )}
          </h4>
          <div className="space-y-2">
            {items.map((item, _index) => (
              <div
                key={_index}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${
                  type === 'quiz'
                    ? 'bg-white hover:bg-purple-50 border-purple-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(item.fileName)}
                  <div>
                    <span className={`text-sm ${type === 'quiz' ? 'text-purple-900' : 'text-gray-900'}`}>
                      {item.fileName}
                    </span>
                    <p className={`text-xs ${type === 'quiz' ? 'text-purple-500' : 'text-gray-500'}`}>
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`${
                    type === 'quiz'
                      ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-100'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  onClick={() => handleDownload(item.downloadUrl)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12 text-red-600">
        강의 정보를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
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
          <Button
            onClick={() => navigate(`/admin/courses/${id}/edit`)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            강의 수정
          </Button>
        </div>

        {/* Zoom 링크 섹션 */}
        {course.classmode === 'ONLINE' && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Link className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Zoom 링크</h2>
              </div>
              <Button
                onClick={() => navigate(`/admin/courses/${id}/edit`)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                variant="ghost"
                size="sm"
              >
                <Link className="w-4 h-4 mr-2" />
                {course.zoom_link ? '수정하기' : '링크 설정하기'}
              </Button>
            </div>
            {course.zoom_link ? (
              <div className="flex items-center gap-4">
                <a 
                  href={course.zoom_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:underline text-lg bg-blue-50 p-3 rounded-lg"
                >
                  {course.zoom_link}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(course.zoom_link || '');
                    toast.success('Zoom 링크가 클립보드에 복사되었습니다.');
                  }}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  복사하기
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600">
                  아직 Zoom 링크가 설정되지 않았습니다. 위 버튼을 클릭하여 링크를 설정해주세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 주차 관리 헤더 */}
        <div className="mb-6 flex justify-between items-center bg-white p-5 rounded-xl shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">주차별 수업 관리</h2>
            <p className="text-sm text-gray-500 mt-1">
              {course.weeks?.length || 0}개의 주차가 등록되어 있습니다
            </p>
          </div>
          <Button 
            onClick={handleCreateWeek} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 hover:shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 주차 만들기
          </Button>
        </div>

        {!course.weeks || !Array.isArray(course.weeks) || course.weeks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 주차가 없습니다</h3>
            <p className="text-gray-500 mb-4">새로운 주차를 만들어 강의를 시작해보세요</p>
            <Button 
              onClick={handleCreateWeek}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 주차 만들기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {course.weeks?.map((week) => (
              <Card key={week.weekNumber} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
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

                {selectedWeek === week.weekNumber && (
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
                                {(file.size / 1024 / 1024).toFixed(2)} MB
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
        )}
      </div>
    </div>
  );
};

export default CourseDetail; 