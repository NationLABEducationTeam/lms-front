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
  Paperclip
} from 'lucide-react';
import { Card } from '@/components/common/ui/card';
import { useGetCourseByIdQuery, useCreateWeekMutation, useGetUploadUrlsMutation } from '@/services/api/courseApi';
import { toast } from 'sonner';
import { Week } from '@/types/course';
import { Progress } from '@/components/common/ui/progress';
// 파일 타입별 아이콘 매핑
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
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
      await createWeek({ courseId: id!, weekNumber: nextWeekNumber }).unwrap();
      toast.success(`${nextWeekNumber}주차가 생성되었습니다.`);
      // 새로 생성된 주차로 이동
      navigate(`#${nextWeekNumber}`);
      setSelectedWeek(nextWeekNumber);
    } catch (error) {
      toast.error('주차 생성에 실패했습니다.');
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
        size: file.size
      }));

      const { urls } = await getUploadUrls({
        courseId: id!,
        weekNumber,
        files: fileInfos
      }).unwrap();

      // Upload files to S3 with progress tracking
      await Promise.all(
        urls.map(async ({ url, fileName }, index) => {
          const file = files.find(f => f.name === fileName);
          if (!file) return;

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
            xhr.onload = () => resolve(xhr.response);
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send(file);
          });
        })
      );

      // 업로드 성공 후 처리
      toast.success('파일 업로드가 완료되었습니다.');
      setSelectedFiles(prev => {
        const newState = { ...prev };
        delete newState[weekNumber];
        return newState;
      });
      setUploadProgress({});
      setShowUploadArea(null);
      
      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('파일 업로드에 실패했습니다.');
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
        </div>

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

        {course.weeks?.length === 0 ? (
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

                    {Object.entries(week.materials || {}).map(([category, files]) => (
                      <div key={category} className="mt-6 bg-white p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="font-medium text-gray-900">{category}</h4>
                        </div>
                        <div className="space-y-2">
                          {files.map((file) => (
                            <div
                              key={file.fileName}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                {getFileIcon(file.fileName)}
                                <div>
                                  <span className="text-sm text-gray-900">{file.fileName}</span>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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