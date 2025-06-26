import { FC, useState, ChangeEvent } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/ui/card';
import { Plus, Trash2, GripVertical, ArrowLeft, Upload, Info, FileText, Check, Settings, ListChecks } from 'lucide-react';
import { Textarea } from '@/components/common/ui/textarea';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useCreateReviewTemplateMutation } from '@/services/api/reviewApi';
import { useGetPublicCoursesQuery } from '@/services/api/courseApi';
import { cn } from '@/lib/utils';

// Zod 스키마 정의
const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, '질문 내용을 입력해주세요.'),
  type: z.enum(['TEXT', 'TEXTAREA', 'MULTIPLE_CHOICE']),
  options: z.array(z.object({ value: z.string().min(1) })).optional(),
});

const reviewFormSchema = z.object({
  title: z.string().min(1, '폼 제목을 입력해주세요.'),
  courseId: z.string().min(1, '강의를 선택해주세요.'),
  description: z.string().optional(),
  targetRespondents: z.number().min(0, '목표 인원은 0명 이상이어야 합니다.').optional(),
  questions: z.array(questionSchema).min(1, '최소 1개 이상의 질문을 추가해주세요.'),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { name: '기본 정보', icon: Settings },
    { name: '질문 구성', icon: ListChecks },
    { name: '완료', icon: Check },
  ];

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.name} className="md:flex-1">
            {index < currentStep ? (
              <div className="group flex w-full flex-col border-l-4 border-blue-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-blue-600 transition-colors">{`0${index + 1}`}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : index === currentStep ? (
              <div className="flex w-full flex-col border-l-4 border-blue-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                <span className="text-sm font-medium text-blue-600">{`0${index + 1}`}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-gray-500 transition-colors">{`0${index + 1}`}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const AdminCreateReviewPage: FC = () => {
  const navigate = useNavigate();
  const [createReviewTemplate, { isLoading: isCreating }] = useCreateReviewTemplateMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: courses, isLoading: isLoadingCourses } = useGetPublicCoursesQuery();
  
  const { register, control, handleSubmit, formState: { errors }, trigger, watch } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: "onChange",
    defaultValues: {
      title: '',
      courseId: '',
      description: '',
      targetRespondents: 0,
      questions: [
        { text: '과정에 전반적으로 만족하시나요?', type: 'MULTIPLE_CHOICE', id: genId() },
        { text: '가장 도움이 되었던 부분은 무엇인가요?', type: 'TEXTAREA', id: genId() },
        { text: '개선되었으면 하는 점이 있다면 알려주세요.', type: 'TEXTAREA', id: genId() },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      move(result.source.index, result.destination.index);
    }
  };

  function genId() {
    return String(Date.now()) + Math.random().toString(36).slice(2);
  }

  const handleAppend = (type: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE') => {
    let text = '';
    if (type === 'MULTIPLE_CHOICE') text = '만족도를 평가해주세요.';
    append({ text, type, id: genId() });
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (isCreating) return;

    try {
      const templateData = {
        ...data,
        questions: data.questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.type === 'MULTIPLE_CHOICE' ? 
            (q.options?.length ? q.options : [
              { value: '매우 만족' }, { value: '만족' }, { value: '보통' }, { value: '불만족' }, { value: '매우 불만족' }
            ]) : undefined
        }))
      };

      await createReviewTemplate(templateData).unwrap();
      toast.success("설문 템플릿이 성공적으로 생성되었습니다!");
      setCurrentStep(2); // 완료 단계로 이동
    } catch (error) {
      console.error('설문 템플릿 생성 실패:', error);
      toast.error("설문 템플릿 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate: (keyof ReviewFormValues)[] = ['title', 'courseId'];
    const result = await trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(1);
    } else {
      toast.error("필수 정보를 모두 입력해주세요.");
      }
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/admin/reviews')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새로운 후기 설문 만들기</h1>
              <p className="text-gray-500">학생들에게 발송할 후기 폼을 생성합니다.</p>
            </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Stepper currentStep={currentStep} />
          </CardContent>
        </Card>

        {currentStep === 0 && (
          <Card>
          <CardHeader>
              <CardTitle>1. 기본 정보 입력</CardTitle>
              <CardDescription>설문의 제목, 설명 및 대상 강의를 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설문 제목</label>
              <Input {...register('title')} placeholder="예: 쿠버네티스 과정 만족도 조사" />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설문 설명 (선택)</label>
                <Textarea {...register('description')} placeholder="학생들에게 설문의 목적을 간단히 설명해주세요." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연결 강의</label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCourses}>
                    <SelectTrigger>
                        <SelectValue placeholder={isLoadingCourses ? "강의 목록을 불러오는 중..." : "후기를 받을 강의를 선택하세요"} />
                    </SelectTrigger>
                    <SelectContent>
                        {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseId && <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">목표 응답 인원 (선택)</label>
              <Input 
                type="number" 
                {...register('targetRespondents', { valueAsNumber: true })} 
                placeholder="후기를 받을 목표 인원 수를 입력하세요" 
              />
              {errors.targetRespondents && <p className="text-sm text-red-500 mt-1">{errors.targetRespondents.message}</p>}
            </div>
          </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={handleNextStep}>
                다음 단계로
              </Button>
            </CardFooter>
        </Card>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>2. 질문 구성</CardTitle>
                  <CardDescription>학생들에게 전달할 질문을 만들고 순서를 정합니다. {errors.questions?.message && <span className="text-red-500 font-semibold">{errors.questions.message}</span>}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="questions-droppable">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                        {fields.map((field, index) => {
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "p-4 border rounded-lg bg-white space-y-4",
                                    snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                      <GripVertical />
                                    </span>
                                    <p className="font-semibold flex-1 text-gray-800">질문 {index + 1}</p>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                      <Trash2 className="w-4 h-4 text-red-500"/>
                                    </Button>
                                  </div>
                                  <Controller
                                    name={`questions.${index}.type`}
                                    control={control}
                                    render={({ field: typeField }) => (
                                      <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                        <SelectTrigger><SelectValue placeholder="질문 유형 선택" /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="TEXT">단답형</SelectItem>
                                          <SelectItem value="TEXTAREA">장문형</SelectItem>
                                          <SelectItem value="MULTIPLE_CHOICE">만족도 (5점 척도)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  <Textarea {...register(`questions.${index}.text`)} placeholder="질문 내용을 입력하세요. 예: 강의 내용에 만족하시나요?" />
                                  {errors.questions?.[index]?.text && <p className="text-sm text-red-500 mt-1">{errors.questions?.[index]?.text?.message}</p>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="mt-4 pt-4 border-t flex justify-center gap-2">
                      <Button type="button" variant="outline" onClick={() => handleAppend('TEXT')}>
                          <Plus className="w-4 h-4 mr-2" /> 단답형 추가
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleAppend('TEXTAREA')}>
                          <Plus className="w-4 h-4 mr-2" /> 장문형 추가
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleAppend('MULTIPLE_CHOICE')}>
                          <Plus className="w-4 h-4 mr-2" /> 만족도 추가
                      </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                    이전 단계로
                  </Button>
                <Button 
                  type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isCreating}
                >
                      {isCreating ? '생성 중...' : '설문 생성 완료'}
                    </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </DragDropContext>

        {currentStep === 2 && (
          <Card className="text-center p-8">
              <CardHeader>
                  <Check className="w-16 h-16 mx-auto text-green-500 bg-green-100 rounded-full p-2" />
                  <CardTitle className="mt-4 text-2xl">설문 생성 완료!</CardTitle>
                  <CardDescription className="mt-2 text-gray-600">
                      후기 설문이 성공적으로 생성되었습니다. <br/>
                      목록 페이지에서 생성된 설문을 확인하고 관리할 수 있습니다.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => navigate('/admin/reviews')} className="w-full max-w-xs mx-auto">
                      목록으로 돌아가기
            </Button>
              </CardContent>
          </Card>
        )}
        </div>
    </div>
  );
};

export default AdminCreateReviewPage;
