import { FC, useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { Progress } from '@/components/common/ui/progress';

const CreateCourse: FC = () => {
  const navigate = useNavigate();
  const [createCourse] = useCreateCourseMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [price, setPrice] = useState('');
  const [classmode, setClassmode] = useState<'ONLINE' | 'VOD'>('VOD');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [zoomLink, setZoomLink] = useState('');
  const [attendanceWeight, setAttendanceWeight] = useState('20');
  const [assignmentWeight, setAssignmentWeight] = useState('50');
  const [examWeight, setExamWeight] = useState('30');
  const [minAttendanceRate, setMinAttendanceRate] = useState('75');
  const [weeksCount, setWeeksCount] = useState('16');
  const [assignmentCount, setAssignmentCount] = useState('1');
  const [examCount, setExamCount] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalWeight = Number(attendanceWeight) + Number(assignmentWeight) + Number(examWeight);
    if (totalWeight !== 100) {
      toast.error('출석, 과제, 시험 가중치의 합이 100이 되어야 합니다.');
      return;
    }

    try {
      await createCourse({
        title,
        description,
        main_category_id: mainCategory,
        sub_category_id: subCategory,
        thumbnail,
        level,
        price: Number(price),
        classmode,
        zoom_link: classmode === 'ONLINE' ? zoomLink : null,
        weeks_count: Number(weeksCount),
        assignment_count: Number(assignmentCount),
        exam_count: Number(examCount),
        gradeRules: {
          attendance_weight: Number(attendanceWeight),
          assignment_weight: Number(assignmentWeight),
          exam_weight: Number(examWeight),
          min_attendance_rate: Number(minAttendanceRate)
        }
      }).unwrap();

      toast.success('강의가 성공적으로 생성되었습니다.');
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(error.data?.message || '강의 생성에 실패했습니다.');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새로운 강의 만들기</h1>
          <p className="mt-2 text-gray-600">강의 정보와 성적 산출 규칙을 설정해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 카드 */}
          <Card className="p-6 shadow-lg border-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3>기본 정보</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
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
                  <Select
                    id="mainCategory"
                    value={mainCategory}
                    onValueChange={(value) => {
                      setMainCategory(value);
                      setSubCategory(''); // 메인 카테고리가 변경되면 서브카테고리 초기화
                    }}
                    className="mt-1.5"
                  >
                    <option value="">카테고리 선택</option>
                    {Object.entries(CATEGORY_MAPPING).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </Select>
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
                </div>

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

                <div>
                  <Label htmlFor="classmode" className="text-base">수업 방식</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(['VOD', 'ONLINE'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setClassmode(mode)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          classmode === mode
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {mode === 'VOD' ? (
                          <BookOpen className={`w-5 h-5 mx-auto mb-1 ${
                            classmode === mode ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        ) : (
                          <Users className={`w-5 h-5 mx-auto mb-1 ${
                            classmode === mode ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        )}
                        <span className="text-sm font-medium">
                          {mode === 'VOD' ? '동영상 강의' : '실시간 강의'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {classmode === 'ONLINE' && (
                  <div className="col-span-2 animate-in slide-in-from-top duration-300 ease-in-out">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label htmlFor="zoomLink" className="text-base font-medium text-blue-900">
                              Zoom 링크 설정
                            </Label>
                            <p className="text-sm text-blue-700 mt-1">
                              실시간 강의에 사용될 Zoom 미팅 링크를 입력해주세요.
                            </p>
                          </div>
                          <div className="relative">
                            <Input
                              id="zoomLink"
                              value={zoomLink}
                              onChange={(e) => setZoomLink(e.target.value)}
                              placeholder="예: https://zoom.us/j/123456789"
                              className="pl-10 pr-36"
                            />
                            <Users className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            {zoomLink && (
                              <button
                                type="button"
                                onClick={() => window.open(zoomLink, '_blank')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md transition-colors"
                              >
                                링크 테스트
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <div className="w-1 h-1 rounded-full bg-blue-400" />
                            <span>학생들은 강의 상세 페이지에서 이 링크로 접속할 수 있습니다.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-2">
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

                <div className="col-span-2">
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

          {/* 성적 산출 규칙 카드 */}
          <Card className="p-6 shadow-lg border-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <h3>성적 산출 규칙</h3>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isValidWeight
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  총 비율: {totalWeight}%
                </div>
              </div>

              <div className="grid gap-6">
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
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="minAttendanceRate" className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span>최소 출석률</span>
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
                  <p className="mt-2 text-sm text-gray-500">
                    * 이 비율 미만으로 출석한 학생은 자동으로 과락 처리됩니다.
                  </p>
                </div>

                {/* 강의 구성 설정 */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-4">강의 구성 설정</h4>
                  
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
            </div>
          </Card>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
              className="px-6"
            >
              취소
            </Button>
            <Button 
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
              disabled={!isValidWeight}
            >
              강의 생성
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse; 