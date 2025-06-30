import { FC, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/ui/card';
import { Plus, Trash2, GripVertical, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/common/ui/textarea';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useGetReviewTemplateQuery, useUpdateReviewTemplateMutation, ReviewQuestion } from '@/services/api/reviewApi';
import { useGetPublicCoursesQuery } from '@/services/api/courseApi';
import { cn } from '@/lib/utils';

// Zod 스키마 (create와 동일)
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

const AdminEditReviewPage: FC = () => {
  const navigate = useNavigate();
  const { id: reviewId } = useParams<{ id: string }>();

  if (!reviewId) {
    navigate('/admin/reviews');
    toast.error('잘못된 접근입니다.');
    return null;
  }
  
  const { data: reviewTemplate, isLoading: isLoadingTemplate, error: templateError } = useGetReviewTemplateQuery(reviewId);
  const { data: courses, isLoading: isLoadingCourses } = useGetPublicCoursesQuery();
  const [updateReviewTemplate, { isLoading: isUpdating }] = useUpdateReviewTemplateMutation();

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (reviewTemplate) {
      reset({
        title: reviewTemplate.title,
        description: reviewTemplate.description || '',
        courseId: reviewTemplate.courseId || '',
        targetRespondents: reviewTemplate.targetRespondents || 0,
        questions: reviewTemplate.questions.map(q => ({
            id: q.id || genId(),
            text: q.text,
            type: q.type,
            options: q.options || [],
        })),
      });
    }
  }, [reviewTemplate, reset]);

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
    return `new-${String(Date.now())}${Math.random().toString(36).slice(2)}`;
  }
  
  const handleAppend = (type: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE') => {
    let text = '';
    if (type === 'MULTIPLE_CHOICE') text = '만족도를 평가해주세요.';
    append({ text, type, id: genId() });
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (isUpdating) return;

    try {
      const templateData = {
        ...data,
        questions: data.questions.map(q => ({
          id: q.id?.includes('new-') ? undefined : q.id,
          text: q.text,
          type: q.type,
          options: q.type === 'MULTIPLE_CHOICE' ? 
            (q.options && q.options.length > 0 ? q.options : [
              { value: '매우 만족' }, { value: '만족' }, { value: '보통' }, { value: '불만족' }, { value: '매우 불만족' }
            ]) : undefined,
        })),
      };

      if (!reviewId) throw new Error("Review ID is missing");

      await updateReviewTemplate({ id: reviewId, data: templateData }).unwrap();
      toast.success("설문 템플릿이 성공적으로 수정되었습니다!");
      navigate('/admin/reviews');
    } catch (error) {
      console.error('설문 템플릿 수정 실패:', error);
      toast.error("설문 템플릿 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-4 text-lg">설문 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (templateError) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">오류 발생</h2>
        <p className="mt-2 text-gray-600">설문 정보를 불러오는 데 실패했습니다.</p>
        <Button onClick={() => navigate('/admin/reviews')} className="mt-6">
          목록으로 돌아가기
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/reviews')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">후기 설문 수정하기</h1>
              <p className="text-gray-500">생성된 후기 폼의 내용을 수정합니다.</p>
            </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCourses}>
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
              </Card>

              {/* 질문 구성 */}
              <Card>
                <CardHeader>
                  <CardTitle>질문 구성</CardTitle>
                  <CardDescription>학생들에게 전달할 질문을 만들고 순서를 정합니다. {errors.questions?.message && <span className="text-red-500 font-semibold">{errors.questions.message}</span>}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="questions-droppable">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={String(field.id)} index={index}>
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
                                      <Select onValueChange={typeField.onChange} value={typeField.value}>
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
                          ))}
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
              </Card>

              {/* 제출 버튼 */}
              <div className="flex justify-end gap-4">
                 <Button type="button" variant="outline" onClick={() => navigate('/admin/reviews')}>
                    취소
                  </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      수정 중...
                    </>
                  ) : '설문 수정 완료'}
                </Button>
              </div>
          </form>
        </DragDropContext>
        </div>
    </div>
  );
};

export default AdminEditReviewPage; 