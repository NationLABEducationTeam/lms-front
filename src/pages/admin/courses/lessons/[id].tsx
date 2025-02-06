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

    try {
      setUploading(true);
      const fileInfos = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));

      console.log('Uploading files for course:', courseId, 'week:', weekNumber);
      console.log('File infos:', fileInfos);

      const response = await getUploadUrls(courseId, weekNumber, fileInfos);
      const urls = response.urls;

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
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [weekDataMap, setWeekDataMap] = useState<Map<number, WeekData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage>({ 
    title: '', 
    description: '', 
    type: 'success' 
  });
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomLink, setZoomLink] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedWeekForUpload, setSelectedWeekForUpload] = useState<number | null>(null);

  // 코스 기본 정보 로드
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setIsLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`${getApiUrl(`/admin/courses/${id}`)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || '강의 정보를 불러오는데 실패했습니다.');
        }
        
        const { course, weeks } = data.data;
        setCourse(course);
        
        // 주차 데이터 초기화
        const initialWeekData = new Map<number, WeekData>();
        weeks.forEach((week: Week) => {
          initialWeekData.set(week.weekNumber, {
            week: week.weekNumber,
            lessons: [],
            isLoading: false,
            isLoaded: true,
            materials: week.materials
          });
        });
        setWeekDataMap(initialWeekData);
        
        if (course.zoom_link) {
          setZoomLink(course.zoom_link);
        }
      } catch (error) {
        console.error('Error loading course details:', error);
        showToast('강의 정보 로드 실패', error instanceof Error ? error.message : '강의 정보를 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseInfo();
  }, [id]);

  // 주차별 데이터 로드
  const loadWeekData = useCallback(async (week: number) => {
    if (!weekDataMap.get(week)?.isLoaded && !weekDataMap.get(week)?.isLoading) {
      try {
        setWeekDataMap(prev => new Map(prev).set(week, {
          ...prev.get(week)!,
          isLoading: true
        }));

        // TODO: API 연동
        // const weekLessons = await getWeekLessons(id, week);
        await new Promise(resolve => setTimeout(resolve, 500)); // 임시 딜레이
        const weekLessons = [
          { id: `${week}-1`, title: `${week}주차 1강: 소개`, description: '강의 소개', week, order: 1 },
          { id: `${week}-2`, title: `${week}주차 2강: 기초`, description: '기초 내용', week, order: 2 },
        ];

        setWeekDataMap(prev => new Map(prev).set(week, {
          week,
          lessons: weekLessons,
          isLoading: false,
          isLoaded: true
        }));
      } catch (error) {
        showToast('주차 데이터 로드 실패', `${week}주차 데이터를 불러오는데 실패했습니다.`, 'error');
        setWeekDataMap(prev => new Map(prev).set(week, {
          ...prev.get(week)!,
          isLoading: false
        }));
      }
    }
  }, [id, weekDataMap]);

  // Accordion 변경 핸들러
  const handleAccordionChange = (value: string[]) => {
    setExpandedWeeks(value);
    value.forEach(weekValue => {
      const week = parseInt(weekValue.replace('week-', ''));
      if (!isNaN(week)) {
        loadWeekData(week);
      }
    });
  };

  const showToast = (title: string, description: string, type: 'success' | 'error') => {
    setToastMessage({ title, description, type });
    setToastOpen(true);
  };

  const handleZoomLinkSave = async () => {
    try {
      // TODO: API 연동
      // await updateCourseZoomLink(id, zoomLink);
      showToast('Zoom 링크 저장 완료', 'Zoom 링크가 성공적으로 저장되었습니다.', 'success');
      setIsEditingZoom(false);
      setCourse(prev => prev ? { ...prev, zoom_link: zoomLink } : null);
    } catch (error) {
      showToast('Zoom 링크 저장 실패', '저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 새 주차 추가 핸들러
  const handleAddWeek = async () => {
    try {
      setIsLoading(true);
      const maxWeekNumber = Math.max(...Array.from(weekDataMap.keys()));
      const nextWeekNumber = maxWeekNumber + 1;

      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${getApiUrl(`/admin/courses/${id}`)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weekNumber: nextWeekNumber })
      });

      if (!response.ok) {
        throw new Error('Failed to add new week');
      }

      showToast('주차 추가 완료', `${nextWeekNumber}주차가 성공적으로 추가되었습니다.`, 'success');
      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error adding new week:', error);
      showToast('주차 추가 실패', '새로운 주차를 추가하는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = (weekNumber: number) => {
    setSelectedWeekForUpload(weekNumber);
    setUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
            <p className="mt-1 text-gray-500">주차별 수업 관리</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {/* Zoom Link Section */}
          <Card className="p-6 bg-white shadow-sm border-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Zoom 링크 관리</h2>
                {!isEditingZoom && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingZoom(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                )}
              </div>
              {isEditingZoom ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoomLink">Zoom 링크</Label>
                    <Input
                      id="zoomLink"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingZoom(false);
                        setZoomLink(course?.zoom_link || '');
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleZoomLinkSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  {course?.zoom_link ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={course.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {course.zoom_link}
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">등록된 Zoom 링크가 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 bg-white shadow-sm border-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">수업 목록</h2>
              <Button
                onClick={handleAddWeek}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? '처리중...' : '새 주차 추가'}
              </Button>
            </div>
          </Card>

          {/* Lessons List */}
          <Card className="bg-white shadow-sm border-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">강의 정보를 불러오는 중...</p>
              </div>
            ) : !course ? (
              <div className="p-8 text-center">
                <h3 className="mt-2 text-sm font-semibold text-gray-900">강의 정보를 찾을 수 없습니다</h3>
              </div>
            ) : (
              <Accordion.Root 
                type="multiple" 
                className="divide-y divide-gray-100"
                value={expandedWeeks}
                onValueChange={handleAccordionChange}
              >
                {Array.from(weekDataMap.values()).map((weekData) => (
                  <Accordion.Item 
                    key={weekData.week} 
                    value={`week-${weekData.week}`} 
                    className="border-b border-gray-200 last:border-0"
                  >
                    <Accordion.Header className="flex">
                      <Accordion.Trigger className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50">
                        <span className="text-lg font-semibold text-gray-900">{weekData.week}주차</span>
                        <ChevronDown className="w-5 h-5 text-gray-500 transform transition-transform duration-200" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content>
                      <div className="p-6 bg-white border-t border-slate-200">
                        {weekData.isLoading ? (
                          <div className="py-4 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-sm text-gray-500">수업 목록을 불러오는 중...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* 강의 자료 섹션 */}
                            {weekData.materials && Object.entries(weekData.materials).map(([type, files]) => (
                              <div key={type} className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {type === 'document' ? '강의 자료' :
                                   type === 'video' ? '강의 영상' :
                                   type === 'quiz' ? '퀴즈' : type}
                                </h4>
                                <div className="grid gap-4">
                                  {files.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                          {type === 'document' ? (
                                            <FileText className="h-6 w-6 text-blue-500" />
                                          ) : type === 'video' ? (
                                            <Video className="h-6 w-6 text-purple-500" />
                                          ) : (
                                            <FileText className="h-6 w-6 text-gray-500" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(file.lastModified).toLocaleDateString()} • {formatFileSize(file.size)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          asChild
                                        >
                                          <a
                                            href={file.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1"
                                          >
                                            <Download className="h-4 w-4" />
                                            <span>다운로드</span>
                                          </a>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => {/* TODO: 파일 삭제 */}}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* 수업 목록 섹션 */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-gray-900">수업 목록</h4>
                                <Button
                                  size="sm"
                                  onClick={() => handleUploadClick(weekData.week)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  강의 자료 추가하기
                                </Button>
                              </div>
                              {weekData.lessons.length > 0 ? (
                                <div className="space-y-4">
                                  {weekData.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                                    >
                                      <div>
                                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                        <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {/* TODO: 수업 수정 */}}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {/* TODO: 수업 삭제 */}}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-gray-500 py-4">등록된 수업이 없습니다.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </Card>
        </div>

        {/* Toast */}
        <Toast.Provider>
          <Toast.Root
            open={toastOpen}
            onOpenChange={setToastOpen}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg
              ${toastMessage.type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}
          >
            <Toast.Title className="font-medium">{toastMessage.title}</Toast.Title>
            <Toast.Description className="mt-1 text-sm">
              {toastMessage.description}
            </Toast.Description>
          </Toast.Root>
        </Toast.Provider>

        {/* Upload Modal */}
        {selectedWeekForUpload && (
          <UploadModal
            isOpen={uploadModalOpen}
            onClose={() => {
              setUploadModalOpen(false);
              setSelectedWeekForUpload(null);
            }}
            weekNumber={selectedWeekForUpload}
            courseId={id}
          />
        )}
      </div>
    </div>
  );
};

export default CourseLessons; 