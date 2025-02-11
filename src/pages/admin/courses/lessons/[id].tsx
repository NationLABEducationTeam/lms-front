import { FC, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Plus, ArrowLeft, Edit2, Trash2, ChevronDown, FileText, Video, Download, Upload } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { getAdminCourseDetail, getUploadUrls } from '@/services/api/courses';
import { Course as BaseCourse } from '@/types/course';
import { getApiUrl } from '@/config/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useGetCourseByIdQuery, useUpdateCourseMutation, useGetUploadUrlsMutation, useCreateWeekMutation } from '@/services/api/courseApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';

// 파일 크기 포맷팅 유틸리티 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Course 인터페이스를 기존 타입을 확장하여 정의
interface Course extends BaseCourse {
  materials?: {
    [key: string]: {
      fileName: string;
      downloadUrl: string;
      lastModified: string;
      size: number;
    }[];
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  week: number;
  order: number;
  videoUrl?: string;
  attachments?: string[];
}

interface Week {
  weekNumber: number;
  materials: {
    [key: string]: {
      fileName: string;
      downloadUrl: string;
      lastModified: string;
      size: number;
    }[];
  };
}

interface WeekData {
  week: number;
  lessons: Lesson[];
  isLoading: boolean;
  isLoaded: boolean;
  materials?: {
    [key: string]: {
      fileName: string;
      downloadUrl: string;
      lastModified: string;
      size: number;
    }[];
  };
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  courseId: string;
}

interface PresignedUrlResponse {
  fileName: string;
  url: string;
  key: string;
}

type ToastType = 'success' | 'error';

interface ToastMessage {
  title: string;
  description: string;
  type: ToastType;
}

const UploadModal: FC<UploadModalProps> = ({ isOpen, onClose, weekNumber, courseId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage>({ 
    title: '', 
    description: '', 
    type: 'success' 
  });

  const [getUploadUrls] = useGetUploadUrlsMutation();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setToastMessage({
        title: '업로드 실패',
        description: '업로드할 파일을 선택해주세요.',
        type: 'error'
      });
      setShowToast(true);
      return;
    }

    if (!courseId) {
      console.error('Course ID is undefined');
      setToastMessage({
        title: '업로드 실패',
        description: '강의 정보를 찾을 수 없습니다.',
        type: 'error'
      });
      setShowToast(true);
      return;
    }

    try {
      setUploading(true);
      const fileInfos = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      console.log('Uploading files for course:', courseId, 'week:', weekNumber);
      console.log('File infos:', fileInfos);

      const { urls } = await getUploadUrls({
        courseId,
        weekNumber,
        files: fileInfos
      }).unwrap();

      // Upload files in parallel
      await Promise.all(
        files.map(async (file, index) => {
          const presignedUrl = urls[index].url;
          
          // XMLHttpRequest를 사용하여 업로드 진행률 추적
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(prev => ({
                  ...prev,
                  [file.name]: percentComplete
                }));
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200) {
                resolve(xhr.response);
              } else {
                reject(new Error(`Failed to upload ${file.name}`));
              }
            };

            xhr.onerror = () => {
              reject(new Error(`Network error while uploading ${file.name}`));
            };

            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          });
        })
      );

      setToastMessage({
        title: '업로드 성공',
        description: '파일이 성공적으로 업로드되었습니다.',
        type: 'success'
      });
      setShowToast(true);

      // 모달 닫기 전에 약간의 딜레이를 줘서 사용자가 성공 메시지를 볼 수 있게 함
      setTimeout(() => {
        onClose();
        window.location.reload(); // 페이지 새로고침
        setFiles([]);  // 파일 목록 초기화
        setUploadProgress({});  // 진행률 초기화
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setToastMessage({
        title: '업로드 실패',
        description: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[95vw] max-w-2xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {weekNumber}주차 강의 자료 업로드
          </Dialog.Title>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              파일을 드래그하여 업로드하거나
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                파일 선택
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-3">
              {files.map((file) => (
                <div key={file.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {uploadProgress[file.name] || 0}%
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? '업로드 중...' : '업로드'}
            </Button>
          </div>

          {/* Toast Notification */}
          <Toast.Provider swipeDirection="right">
            <Toast.Root
              className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
                toastMessage.type === 'error' ? 'bg-red-600' : 'bg-green-600'
              } text-white max-w-md`}
              open={showToast}
              onOpenChange={setShowToast}
            >
              <Toast.Title className="font-semibold mb-1">{toastMessage.title}</Toast.Title>
              <Toast.Description>{toastMessage.description}</Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="fixed bottom-0 right-0 p-4 w-full max-w-md list-none" />
          </Toast.Provider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const CourseLessons: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openWeeks, setOpenWeeks] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [zoomLink, setZoomLink] = useState('');
  const [isEditingZoomLink, setIsEditingZoomLink] = useState(false);

  const { data: course, isLoading, error } = useGetCourseByIdQuery(id ?? skipToken);
  const [updateCourse] = useUpdateCourseMutation();
  const [createWeek] = useCreateWeekMutation();

  const handleAccordionChange = (value: string[]) => {
    setOpenWeeks(value);
    // 해시 업데이트
    if (value.length > 0) {
      const lastOpenedWeek = value[value.length - 1];
      window.location.hash = `week${lastOpenedWeek}`;
    } else {
      window.location.hash = '';
    }
  };

  // URL 해시 기반으로 초기 주차 열기
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#week')) {
      const weekNumber = hash.replace('#week', '');
      setOpenWeeks([weekNumber]);
    }
  }, []);

  const handleZoomLinkSave = async () => {
    if (!course) return;

    try {
      await updateCourse({
        id: course.id,
        body: {
          zoom_link: zoomLink
        }
      }).unwrap();

      toast.success('Zoom 링크가 저장되었습니다.');
      setIsEditingZoomLink(false);
    } catch (error) {
      toast.error('Zoom 링크 저장에 실패했습니다.');
    }
  };

  const handleUploadClick = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setUploadModalOpen(true);
  };

  const handleNewWeekClick = async () => {
    console.log('New week button clicked');
    if (!id) {
      console.error('Course ID is undefined');
      toast.error('강의 ID를 찾을 수 없습니다.');
      return;
    }
    
    if (!course) {
      console.error('Course data is undefined');
      toast.error('강의 정보를 찾을 수 없습니다.');
      return;
    }

    console.log('Course ID:', id);
    console.log('Course data:', course);
    
    const nextWeekNumber = course.weeks?.length + 1 || 1;
    console.log('Attempting to create new week:', { courseId: id, weekNumber: nextWeekNumber });
    
    try {
      const result = await createWeek({
        courseId: id,
        weekNumber: nextWeekNumber
      }).unwrap();
      
      console.log('Create week result:', result);
      toast.success('새 주차가 생성되었습니다.');
      
      // 새로 생성된 주차로 해시 업데이트 및 리로드
      window.location.hash = `week${nextWeekNumber}`;
      window.location.reload();
    } catch (error) {
      console.error('Error creating new week:', error);
      const errorMessage = error instanceof Error ? error.message : '새 주차 생성에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  // 파일 다운로드 처리 함수
  const handleFileClick = async (downloadUrl: string, fileName: string) => {
    console.log('파일 다운로드 시작:', { downloadUrl, fileName });
    
    try {
      // 파일 확장자 확인
      const extension = fileName.split('.').pop()?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(extension || '');
      
      if (isImage) {
        // 이미지 파일인 경우 fetch로 다운로드
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // 다른 파일들은 기존 방식대로 처리
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      console.log('다운로드 완료:', fileName);
    } catch (error) {
      console.error('파일 다운로드 중 오류 발생:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400">강의 정보를 불러오는데 실패했습니다.</p>
            <Button
              onClick={() => navigate('/admin/courses')}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              강의 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            강의 목록
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500">{course.description}</p>
          </div>
        </div>

        {/* Zoom 링크 섹션 */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Zoom 링크</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingZoomLink(!isEditingZoomLink)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            {isEditingZoomLink ? (
              <div className="space-y-4">
                <Input
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="Zoom 링크를 입력하세요"
                  className="bg-white border-gray-200"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingZoomLink(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleZoomLinkSave}
                  >
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                {course.zoom_link || '등록된 Zoom 링크가 없습니다.'}
              </p>
            )}
          </div>
        </Card>

        {/* 주차별 강의 자료 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">주차별 강의 자료</h2>
              <Button
                onClick={() => {
                  console.log('New week button clicked');
                  handleNewWeekClick();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 주차 추가 ({course?.weeks?.length || 0})
              </Button>
            </div>

            <Accordion.Root
              type="multiple"
              value={openWeeks}
              onValueChange={handleAccordionChange}
              className="space-y-4"
            >
              {course?.weeks?.map((week) => (
                <Accordion.Item
                  key={week.weekNumber}
                  value={week.weekNumber.toString()}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <Accordion.Trigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-gray-900">
                    <span className="font-medium">
                      {week.weekNumber}주차
                    </span>
                    <ChevronDown className="w-4 h-4 transform transition-transform duration-200 ease-in-out" />
                  </Accordion.Trigger>
                  <Accordion.Content className="p-4 pt-0">
                    <div className="space-y-4">
                      {/* 강의 자료 목록 */}
                      {Object.entries(week.materials).map(([type, files]) => (
                        <div key={type}>
                          {files.map((material) => (
                            <div
                              key={material.fileName}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{material.fileName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: 삭제 기능 구현
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <a
                                  href={material.downloadUrl}
                                  download={material.fileName}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* 파일 업로드 버튼 */}
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
                        onClick={() => handleUploadClick(week.weekNumber)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        파일 업로드
                      </Button>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </Card>
      </div>

      {/* 업로드 모달 */}
      {selectedWeek !== null && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedWeek(null);
          }}
          weekNumber={selectedWeek}
          courseId={id!}  // URL의 id 파라미터 사용
        />
      )}
    </div>
  );
};

export default CourseLessons; 