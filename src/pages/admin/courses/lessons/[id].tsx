import { FC, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Plus, ArrowLeft, Edit2, Trash2, ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';

interface Course {
  id: string;
  title: string;
  description: string;
  zoomLink?: string;
  totalWeeks: number;
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

interface WeekData {
  week: number;
  lessons: Lesson[];
  isLoading: boolean;
  isLoaded: boolean;
}

const CourseLessons: FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [weekDataMap, setWeekDataMap] = useState<Map<number, WeekData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomLink, setZoomLink] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);

  // 코스 기본 정보 로드
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setIsLoading(true);
        // TODO: API 연동
        // const courseData = await getCourseInfo(id);
        const courseData = {
          id,
          title: "테스트 강의",
          description: "강의 설명",
          zoomLink: "https://zoom.us/j/example",
          totalWeeks: 4 // 예시로 15주차
        };
        
        setCourse(courseData);
        
        // 주차 데이터 초기화
        const initialWeekData = new Map<number, WeekData>();
        for (let week = 1; week <= courseData.totalWeeks; week++) {
          initialWeekData.set(week, {
            week,
            lessons: [],
            isLoading: false,
            isLoaded: false
          });
        }
        setWeekDataMap(initialWeekData);
        
        if (courseData.zoomLink) {
          setZoomLink(courseData.zoomLink);
        }
      } catch (error) {
        showToast('강의 정보 로드 실패', '강의 정보를 불러오는데 실패했습니다.', 'error');
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
      setCourse(prev => prev ? { ...prev, zoomLink } : null);
    } catch (error) {
      showToast('Zoom 링크 저장 실패', '저장 중 오류가 발생했습니다.', 'error');
    }
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
                        setZoomLink(course?.zoomLink || '');
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
                  {course?.zoomLink ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={course.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {course.zoomLink}
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
                onClick={() => {/* TODO: 수업 추가 모달 */}}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 수업 추가
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
                    <Accordion.Content className="px-6 pb-6">
                      {weekData.isLoading ? (
                        <div className="py-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="mt-2 text-sm text-gray-500">수업 목록을 불러오는 중...</p>
                        </div>
                      ) : (
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
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {/* TODO: 수업 삭제 */}}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
      </div>
    </div>
  );
};

export default CourseLessons; 