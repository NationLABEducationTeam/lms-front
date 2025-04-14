import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Textarea } from '@/components/common/ui/textarea';
import { Select } from '@/components/common/ui/select';
import { useCreateCourseMutation } from '@/services/api/courseApi';
import { CourseLevel, CATEGORY_MAPPING } from '@/types/course';
import { toast } from 'sonner';
import { Slider } from '@/components/common/ui/slider';
import { 
  BookOpen, 
  GraduationCap, 
  PieChart, 
  Users, 
  Clock,
  Upload,
  Pencil,
  GanttChartSquare,
  Calendar,
  BookCheck,
  FileCheck,
  Video,
  Settings,
  RefreshCw,
  Lock,
  Mic,
  MicOff,
  UserPlus,
  Camera,
  AtSign,
  Check,
  AlertTriangle,
  AlertCircle,
  Zap,
  Sparkles,
  CalendarCheck,
  ChevronRight,
  ChevronsRight,
  ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/common/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Switch } from '@/components/common/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const CreateCourse: FC = () => {
  const navigate = useNavigate();
  const [createCourse] = useCreateCourseMutation();
  
  // 단계 관리를 위한 상태
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formProgress, setFormProgress] = useState<number>(25);
  const totalSteps = 4;
  
  // 기본 정보 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [price, setPrice] = useState('');
  const [classmode, setClassmode] = useState<'ONLINE' | 'VOD'>('ONLINE');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [zoomLink, setZoomLink] = useState('');
  
  // 성적 관련 상태 
  const [attendanceWeight, setAttendanceWeight] = useState('20');
  const [assignmentWeight, setAssignmentWeight] = useState('50');
  const [examWeight, setExamWeight] = useState('30');
  const [minAttendanceRate, setMinAttendanceRate] = useState('75');
  const [weeksCount, setWeeksCount] = useState('16');
  const [assignmentCount, setAssignmentCount] = useState('1');
  const [examCount, setExamCount] = useState('1');
  
  // Zoom 관련 상태
  const [zoomMeetingName, setZoomMeetingName] = useState('');
  const [zoomStartDate, setZoomStartDate] = useState<Date | null>(null);
  const [zoomStartTime, setZoomStartTime] = useState('');
  const [zoomEndTime, setZoomEndTime] = useState('');
  const [zoomIsRecurring, setZoomIsRecurring] = useState(false);
  const [zoomRecurringType, setZoomRecurringType] = useState('');
  const [zoomRecurringDays, setZoomRecurringDays] = useState<string[]>([]);
  const [zoomRecurringEndType, setZoomRecurringEndType] = useState('');
  const [zoomRecurringEndCount, setZoomRecurringEndCount] = useState('');
  const [zoomRecurringEndDate, setZoomRecurringEndDate] = useState<Date | null>(null);
  const [zoomPasscode, setZoomPasscode] = useState('');
  const [zoomEnableWaitingRoom, setZoomEnableWaitingRoom] = useState(false);
  const [zoomRequireAuthentication, setZoomRequireAuthentication] = useState(false);
  const [zoomSimpleMode, setZoomSimpleMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customMainCategory, setCustomMainCategory] = useState('');
  
  // 단계 구조 정의 
  const steps = [
    { step: 1, title: "기본 정보", icon: <BookOpen className="w-5 h-5" /> },
    { step: 2, title: classmode === 'ONLINE' ? "강의 및 미팅 설정" : "강의 설정", icon: <Settings className="w-5 h-5" /> },
    { step: 3, title: "성적 설정", icon: <PieChart className="w-5 h-5" /> },
    { step: 4, title: "최종 확인", icon: <FileCheck className="w-5 h-5" /> }
  ];

  // 단계 전환 함수
  const nextStep = () => {
    if (currentStep < totalSteps) {
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      setFormProgress(nextStepNumber * (100 / totalSteps));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      setFormProgress(prevStepNumber * (100 / totalSteps));
    }
  };

  // 각 단계별 유효성 검사
  const validateStep1 = (): boolean => {
    if (!title) {
      toast.error("강의 제목을 입력해주세요.");
      return false;
    }
    if (!mainCategory) {
      toast.error("메인 카테고리를 선택해주세요.");
      return false;
    }
    if (mainCategory === 'custom' && !customMainCategory) {
      toast.error("직접 입력할 메인 카테고리를 입력해주세요.");
      return false;
    }
    if (!subCategory) {
      toast.error("서브 카테고리를 입력해주세요.");
      return false;
    }
    if (!description) {
      toast.error("강의 설명을 입력해주세요.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!price) {
      toast.error("가격을 입력해주세요.");
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    // 성적 비중 합계가 100인지 검증
    const totalWeight = Number(attendanceWeight) + Number(assignmentWeight) + Number(examWeight);
    if (totalWeight !== 100) {
      toast.error("성적 비중의 합이 100%가 되어야 합니다.");
      return false;
    }
    if (!weeksCount || Number(weeksCount) <= 0) {
      toast.error("유효한 차수 수를 입력해주세요.");
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    // ONLINE 모드인 경우는 이미 2단계에서 확인했으므로 항상 true 반환
    return true;
  };

  // 현재 단계에 따른 유효성 검사 후 다음 단계로 이동
  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      nextStep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 마지막 단계가 아니면 다음 단계로 이동
    if (currentStep < totalSteps) {
      handleNextStep();
      return;
    }
    
    // 최종 제출 전 모든 단계 유효성 검사
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Zoom 미팅 설정 데이터 구성
      let zoomMeetingData = null;
      if (classmode === "ONLINE") {
        zoomMeetingData = {
          meeting_name: zoomMeetingName || title,
          start_date: format(zoomStartDate!, 'yyyy-MM-dd'),
          start_time: zoomStartTime,
          end_time: zoomEndTime,
          is_recurring: !zoomSimpleMode && zoomIsRecurring,
          recurring_type: zoomRecurringType || undefined,
          recurring_days: zoomRecurringDays.length > 0 
            ? zoomRecurringDays.map(d => getZoomDayIndex(parseInt(d)).toString())
            : undefined,
          recurring_end_type: zoomRecurringEndType || undefined,
          recurring_end_count: zoomRecurringEndCount || undefined,
          recurring_end_date: zoomRecurringEndDate ? format(zoomRecurringEndDate, 'yyyy-MM-dd') : undefined,
          auto_recording: false,
          mute_participants: false,
          host_video: true,
          participant_video: true,
          waiting_room: zoomEnableWaitingRoom,
          join_before_host: false,
          passcode: zoomPasscode || undefined,
          require_authentication: zoomRequireAuthentication,
          alternative_hosts: undefined
        };
      }

      // 강의 데이터 구성
      const courseData = {
        title,
        description,
        main_category_id: mainCategory === 'custom' ? customMainCategory : mainCategory,
        sub_category_id: subCategory,
        thumbnail,
        level,
        price: Number(price),
        classmode,
        zoom_link: null,
        weeks_count: Number(weeksCount),
        assignment_count: Number(assignmentCount),
        exam_count: Number(examCount),
        gradeRules: {
          attendance_weight: Number(attendanceWeight),
          assignment_weight: Number(assignmentWeight),
          exam_weight: Number(examWeight),
          min_attendance_rate: Number(minAttendanceRate)
        }
      };

      // ONLINE 모드일 때 Zoom 미팅 설정 추가
      if (classmode === "ONLINE" && zoomMeetingData) {
        Object.assign(courseData, { zoom_meeting: zoomMeetingData });
      }

      console.log('API 요청 데이터:', JSON.stringify(courseData, null, 2));

      // API 요청
      const response = await createCourse(courseData).unwrap();

      toast.success("강의가 성공적으로 생성되었습니다!");
      navigate('/admin/courses');
    } catch (error) {
      console.error("강의 생성 중 오류 발생:", error);
      toast.error("강의 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 가중치 합계 계산
  const totalWeight = Number(attendanceWeight) + Number(assignmentWeight) + Number(examWeight);
  const isValidWeight = totalWeight === 100;

  // 파일 미리보기 URL 상태
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // 썸네일 변경 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttendanceWeightChange = (value: number[]) => {
    setAttendanceWeight(value[0].toString());
  };

  const handleAssignmentWeightChange = (value: number[]) => {
    setAssignmentWeight(value[0].toString());
  };

  const handleExamWeightChange = (value: number[]) => {
    setExamWeight(value[0].toString());
  };

  const handleMinAttendanceRateChange = (value: number[]) => {
    setMinAttendanceRate(value[0].toString());
  };

  // 상세/간편 모드 전환 관리를 위한 상태 변경 함수
  const handleTabChange = (value: string) => {
    setZoomSimpleMode(value === 'simple');
  };

  // 요일 이름 배열
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // Zoom API와 호환되는 요일 인덱스 변환 함수
  const getZoomDayIndex = (dayIndex: number) => {
    // dayIndex는 0(일)~6(토)인데, Zoom API는 1(일)~7(토)를 사용함
    return dayIndex + 1;
  };
  
  // 설정 요약 텍스트 생성
  const getZoomSettingSummary = () => {
    if (!zoomStartDate || !zoomStartTime || !zoomEndTime) return '';
    
    const dateStr = format(zoomStartDate, 'yyyy년 MM월 dd일');
    const startTimeFormatted = zoomStartTime.substring(0, 5);
    const endTimeFormatted = zoomEndTime.substring(0, 5);
    
    let recurringText = '';
    
    if (!zoomSimpleMode && zoomIsRecurring) {
      if (zoomRecurringType === 'daily') {
        recurringText = '매일';
      } else if (zoomRecurringType === 'weekly' && zoomRecurringDays.length > 0) {
        const selectedDays = zoomRecurringDays
          .map(d => parseInt(d))
          .sort((a, b) => a - b)
          .map(dayIndex => dayNames[dayIndex])
          .join(', ');
        recurringText = `매주 ${selectedDays}요일`;
      } else if (zoomRecurringType === 'monthly') {
        recurringText = '매월';
      }
      
      if (zoomRecurringEndType === 'after' && zoomRecurringEndCount) {
        recurringText += ` (${zoomRecurringEndCount}회 후 종료)`;
      } else if (zoomRecurringEndType === 'until' && zoomRecurringEndDate) {
        recurringText += ` (${format(zoomRecurringEndDate, 'yyyy-MM-dd')}까지)`;
      }
    } else {
      const dayOfWeek = dayNames[zoomStartDate.getDay()];
      recurringText = zoomSimpleMode ? `매주 ${dayOfWeek}요일` : `${dateStr} (${dayOfWeek})`;
    }
    
    return `${recurringText} ${startTimeFormatted} - ${endTimeFormatted}`;
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto py-8 space-y-8">
      {/* 단계 진행 표시 */}
      <Card className="p-6 border-0 shadow-md">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">새 강의 개설</h1>
          <p className="text-gray-600">강의 정보를 단계별로 입력해주세요.</p>
        </div>
        
        <div className="mb-4">
          <Progress value={formProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {steps.map(item => (
            <div 
              key={item.step} 
              className={`flex items-center gap-2 p-3 rounded-md transition-all ${
                currentStep === item.step
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : currentStep > item.step
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === item.step
                  ? 'bg-blue-100 text-blue-700'
                  : currentStep > item.step
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
              }`}>
                {currentStep > item.step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {item.icon}
                <span>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 단계 1: 기본 정보 */}
      {currentStep === 1 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3>기본 정보</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-base">강의 제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="강의의 핵심 내용을 잘 표현하는 제목을 입력하세요"
                  className="mt-1.5 h-12 text-lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mainCategory" className="text-base">메인 카테고리</Label>
                <div className="space-y-2 mt-1.5">
                  <Select
                    id="mainCategory"
                    value={mainCategory}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        // 직접 입력 모드로 전환
                        setMainCategory('custom');
                      } else {
                        setMainCategory(value);
                        setSubCategory(''); // 메인 카테고리가 변경되면 서브카테고리 초기화
                      }
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    {Object.entries(CATEGORY_MAPPING).map(([id, name]) => (
                      id !== 'custom' ? <option key={id} value={id}>{name}</option> : null
                    ))}
                    <option value="custom">직접 입력</option>
                  </Select>

                  {mainCategory === 'custom' && (
                    <div className="mt-2">
                      <Input
                        placeholder="대분류명 직접 입력"
                        className="w-full"
                        value={customMainCategory}
                        onChange={(e) => setCustomMainCategory(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="subCategory" className="text-base">서브 카테고리</Label>
                <Input
                  id="subCategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="서브카테고리를 입력하세요"
                  className="mt-1.5"
                  disabled={!mainCategory}
                />
                {!mainCategory && (
                  <p className="mt-1 text-sm text-gray-500">
                    메인 카테고리를 먼저 선택해주세요.
                  </p>
                )}
                {mainCategory === 'custom' && !customMainCategory && (
                  <p className="mt-1 text-sm text-gray-500">
                    대분류명을 직접 입력해주세요.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-base">강의 설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="강의의 목표, 대상, 커리큘럼 등을 자세히 설명해주세요"
                  className="mt-1.5"
                  rows={6}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="thumbnail" className="text-base">썸네일 이미지</Label>
                <div className="mt-1.5">
                  <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                    thumbnailPreview ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="thumbnail"
                          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          이미지 {thumbnailPreview ? '변경' : '업로드'}
                        </label>
                        <p className="mt-2 text-sm text-gray-500">
                          권장 크기: 1280x720px (16:9 비율)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 단계 2: 세부 설정 */}
      {currentStep === 2 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3>
                {classmode === 'ONLINE' ? '강의 및 미팅 설정' : '강의 설정'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="level" className="text-base">난이도</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {Object.values(CourseLevel).map((levelOption) => (
                    <button
                      key={levelOption}
                      type="button"
                      onClick={() => setLevel(levelOption)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        level === levelOption
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <GraduationCap className={`w-5 h-5 mx-auto mb-1 ${
                        level === levelOption ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {levelOption === 'BEGINNER' ? '입문' :
                         levelOption === 'INTERMEDIATE' ? '중급' : '고급'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="price" className="text-base">가격</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="가격을 입력하세요"
                    className="pl-8 h-12"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="classmode" className="text-base">수업 방식</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  {(['VOD', 'ONLINE'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setClassmode(mode)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        classmode === mode
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {mode === 'VOD' ? (
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className={`w-6 h-6 ${
                            classmode === mode ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <span className="text-sm font-medium">동영상 강의</span>
                          <p className="text-xs text-gray-500 max-w-sm text-center">
                            학생들이 언제든 수강할 수 있는 녹화된 강의 콘텐츠를 제공합니다.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Users className={`w-6 h-6 ${
                            classmode === mode ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <span className="text-sm font-medium">실시간 강의</span>
                          <p className="text-xs text-gray-500 max-w-sm text-center">
                            줌을 통한 실시간 화상 수업으로 직접적인 소통이 가능합니다.
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 온라인(ONLINE) 모드 선택 시 미팅 설정 인라인으로 표시 */}
              {classmode === 'ONLINE' && (
                <div className="md:col-span-2 border rounded-lg p-5 bg-blue-50">
                  <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Zoom 미팅 설정
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="zoomMeetingName" className="text-base font-medium text-gray-800 block mb-2">
                        미팅 이름
                      </Label>
                      <div className="relative">
                        <Input
                          id="zoomMeetingName"
                          value={zoomMeetingName}
                          onChange={(e) => setZoomMeetingName(e.target.value)}
                          placeholder={title ? `${title} 강의` : "미팅 이름을 입력하세요"}
                          className="pl-9 pr-4"
                        />
                        <Video className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        비워두면 강좌 제목을 기반으로 자동 생성됩니다
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Label htmlFor="zoomStartDate" className="text-base font-medium text-gray-800 block mb-2">
                        미팅 일정 <span className="text-red-500">*</span>
                      </Label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="zoomStartDate" className="text-sm text-gray-700 mb-1.5 block">
                            미팅 날짜
                          </Label>
                          <Input
                            id="zoomStartDate"
                            type="date"
                            value={zoomStartDate ? format(zoomStartDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              setZoomStartDate(date);
                            }}
                            className="w-full"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="zoomStartTime" className="text-sm text-gray-700 mb-1.5 block">
                            시작 시간
                          </Label>
                          <Input
                            id="zoomStartTime"
                            type="time"
                            value={zoomStartTime}
                            onChange={(e) => setZoomStartTime(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="zoomEndTime" className="text-sm text-gray-700 mb-1.5 block">
                            종료 시간
                          </Label>
                          <Input
                            id="zoomEndTime"
                            type="time"
                            value={zoomEndTime}
                            onChange={(e) => setZoomEndTime(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="zoomPasscode" className="text-base font-medium text-gray-800">
                          미팅 보안
                        </Label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label htmlFor="zoomPasscode" className="text-sm text-gray-700 mb-1.5 block">
                            접속 암호 (선택 사항)
                          </Label>
                          <div className="relative">
                            <Input
                              id="zoomPasscode"
                              type="text"
                              value={zoomPasscode}
                              onChange={(e) => setZoomPasscode(e.target.value)}
                              placeholder="암호를 입력하세요"
                              className="pl-9"
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="zoomEnableWaitingRoom"
                              checked={zoomEnableWaitingRoom}
                              onCheckedChange={(checked: boolean) => setZoomEnableWaitingRoom(checked)}
                            />
                            <Label
                              htmlFor="zoomEnableWaitingRoom"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              대기실 사용
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="zoomRequireAuthentication"
                              checked={zoomRequireAuthentication}
                              onCheckedChange={(checked: boolean) => setZoomRequireAuthentication(checked)}
                            />
                            <Label
                              htmlFor="zoomRequireAuthentication"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Zoom 계정으로 로그인 요구
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2 mt-6">
                <div className="border rounded-lg p-5 shadow-sm bg-white">
                  <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <GanttChartSquare className="w-5 h-5 text-blue-600" />
                    강의 구성 설정
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weeksCount" className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <span>차수 수</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="weeksCount"
                          type="number"
                          min="1"
                          max="52"
                          value={weeksCount}
                          onChange={(e) => setWeeksCount(e.target.value)}
                          className="w-full"
                        />
                        <span className="ml-2 text-gray-500">차수</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        강의의 총 차수를 입력하세요. (기본값: 16차수)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="assignmentCount" className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                        <span>과제 개수</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="assignmentCount"
                          type="number"
                          min="0"
                          max="20"
                          value={assignmentCount}
                          onChange={(e) => setAssignmentCount(e.target.value)}
                          className="w-full"
                        />
                        <span className="ml-2 text-gray-500">개</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        강의에 포함될 과제 개수를 입력하세요. (기본값: 1개)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examCount" className="flex items-center gap-2">
                        <BookCheck className="w-5 h-5 text-purple-600" />
                        <span>시험 개수</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="examCount"
                          type="number"
                          min="0"
                          max="10"
                          value={examCount}
                          onChange={(e) => setExamCount(e.target.value)}
                          className="w-full"
                        />
                        <span className="ml-2 text-gray-500">개</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        강의에 포함될 시험 개수를 입력하세요. (기본값: 1개)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 단계 3: 성적 설정 */}
      {currentStep === 3 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h3>성적 설정</h3>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                totalWeight === 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                총 비율: {totalWeight}%
                {totalWeight !== 100 && <span className="ml-1 text-amber-800">*100%로 맞춰주세요</span>}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-6 p-5 bg-white rounded-lg border">
                <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  성적 비중 설정
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="attendanceWeight" className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <span>출석 반영 비율</span>
                      </Label>
                      <span className="text-lg font-semibold text-indigo-600">{attendanceWeight}%</span>
                    </div>
                    <Slider
                      id="attendanceWeight"
                      min={0}
                      max={100}
                      step={5}
                      value={[Number(attendanceWeight)]}
                      onValueChange={handleAttendanceWeightChange}
                      className="py-4"
                    />
                    <p className="text-xs text-gray-500">
                      출석이 전체 성적에서 차지하는 비중입니다.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignmentWeight" className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-blue-600" />
                        <span>과제 반영 비율</span>
                      </Label>
                      <span className="text-lg font-semibold text-blue-600">{assignmentWeight}%</span>
                    </div>
                    <Slider
                      id="assignmentWeight"
                      min={0}
                      max={100}
                      step={5}
                      value={[Number(assignmentWeight)]}
                      onValueChange={handleAssignmentWeightChange}
                      className="py-4"
                    />
                    <p className="text-xs text-gray-500">
                      과제가 전체 성적에서 차지하는 비중입니다.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="examWeight" className="flex items-center gap-2">
                        <GanttChartSquare className="w-5 h-5 text-purple-600" />
                        <span>시험 반영 비율</span>
                      </Label>
                      <span className="text-lg font-semibold text-purple-600">{examWeight}%</span>
                    </div>
                    <Slider
                      id="examWeight"
                      min={0}
                      max={100}
                      step={5}
                      value={[Number(examWeight)]}
                      onValueChange={handleExamWeightChange}
                      className="py-4"
                    />
                    <p className="text-xs text-gray-500">
                      시험이 전체 성적에서 차지하는 비중입니다.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">성적 비율 시각화</h4>
                  <div className="h-8 rounded-lg overflow-hidden flex">
                    <div 
                      className="bg-indigo-500 transition-all"
                      style={{ width: `${attendanceWeight}%` }}
                    />
                    <div 
                      className="bg-blue-500 transition-all"
                      style={{ width: `${assignmentWeight}%` }}
                    />
                    <div 
                      className="bg-purple-500 transition-all"
                      style={{ width: `${examWeight}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span>출석</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>과제</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>시험</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-white rounded-lg border">
                <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  출석 관련 설정
                </h4>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="minAttendanceRate" className="flex items-center gap-2">
                      <span>최소 출석률</span>
                      <span className="text-sm text-gray-500">(과락 기준)</span>
                    </Label>
                    <span className="text-lg font-semibold text-green-600">{minAttendanceRate}%</span>
                  </div>
                  <Slider
                    id="minAttendanceRate"
                    min={0}
                    max={100}
                    step={5}
                    value={[Number(minAttendanceRate)]}
                    onValueChange={handleMinAttendanceRateChange}
                    className="py-4"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 inline-block mr-1.5 text-amber-500" />
                    이 비율 미만으로 출석한 학생은 자동으로 과락 처리됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 단계 4: 최종 확인 */}
      {currentStep === 4 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3>최종 확인</h3>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                모든 설정이 완료되었습니다. 아래 내용을 확인하고 최종 제출 버튼을 눌러주세요.
              </p>
            </div>
            
            {/* 설정 내용 요약 표시 */}
            <div className="space-y-4">
              <h4 className="font-medium">강의 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">강의 제목</p>
                  <p className="font-medium">{title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">카테고리</p>
                  <p className="font-medium">
                    {mainCategory === 'custom' ? customMainCategory : CATEGORY_MAPPING[mainCategory as keyof typeof CATEGORY_MAPPING] || mainCategory} - {subCategory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">강의 방식</p>
                  <p className="font-medium">{classmode === 'ONLINE' ? '실시간 강의' : '동영상 강의'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">난이도</p>
                  <p className="font-medium">
                    {level === 'BEGINNER' ? '입문' : level === 'INTERMEDIATE' ? '중급' : '고급'}
                  </p>
                </div>
              </div>
              
              {classmode === 'ONLINE' && (
                <>
                  <h4 className="font-medium mt-6">Zoom 미팅 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">미팅 이름</p>
                      <p className="font-medium">{zoomMeetingName || title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">미팅 일정</p>
                      <p className="font-medium">
                        {zoomStartDate && zoomStartTime ? getZoomSettingSummary() : '미설정'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 다음/이전 버튼 */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button 
            type="button" 
            variant="outline"
            onClick={prevStep}
            className="px-6"
          >
            이전
          </Button>
        )}
        
        <Button 
          type="submit" 
          className={`px-6 ${currentStep === totalSteps ? 'w-32' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              처리 중...
            </div>
          ) : currentStep === totalSteps ? "강의 생성" : "다음"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCourse; 