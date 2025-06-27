import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/common/ui/card';
import { Textarea } from '@/components/common/ui/textarea';
import { Input } from '@/components/common/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/common/ui/label';
import { useGetPublicReviewTemplateQuery, useSubmitReviewResponseMutation } from '@/services/api/reviewApi';
import { toast } from 'sonner';
import { AlertCircle, Check, Loader2, Star, Smile, Meh, Frown, PenSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/common/ui/progress';
import { cn } from '@/lib/utils';

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(1, "답변을 입력하거나 선택해주세요."),
});

const formSchema = z.object({
  userName: z.string().min(1, "이름을 입력해주세요."),
  answers: z.array(answerSchema).min(1, "하나 이상의 질문에 답변해주세요."),
});

type ReviewResponseFormValues = z.infer<typeof formSchema>;

const StudentReviewFormPage: FC = () => {
  const { id: reviewTemplateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: template, isLoading: isLoadingTemplate, error: errorTemplate } = useGetPublicReviewTemplateQuery(reviewTemplateId!, { skip: !reviewTemplateId });
  const [submitResponse, { isLoading: isSubmitting }] = useSubmitReviewResponseMutation();
  
  const { control, handleSubmit, formState: { errors }, reset, register } = useForm<ReviewResponseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      answers: [],
    },
  });
  
  const watchedAnswers = useWatch({ control, name: 'answers' });
  const answeredCount = watchedAnswers?.filter(a => a && a.answer.trim() !== '').length || 0;
  const progressPercentage = template ? (answeredCount / template.questions.length) * 100 : 0;

  useEffect(() => {
    if (template) {
      reset({
        userName: '',
        answers: template.questions.map(q => ({ questionId: q.id!, answer: '' }))
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: ReviewResponseFormValues) => {
    if (!reviewTemplateId) return;

    const filteredAnswers = data.answers.filter(a => a.answer.trim() !== '');
    if (filteredAnswers.length < template!.questions.length) {
      toast.error("모든 질문에 답변해주세요.");
      return;
    }

    try {
      await submitResponse({ reviewTemplateId, userName: data.userName, answers: filteredAnswers }).unwrap();
      toast.success("설문이 성공적으로 제출되었습니다. 소중한 의견 감사합니다!");
      setIsSubmitted(true);
    } catch (error: any) {
        if (error.status === 401) {
            toast.error("답변을 제출하려면 로그인이 필요합니다.", {
                action: {
                    label: "로그인",
                    onClick: () => navigate('/login'),
                },
            });
        } else {
            toast.error(error.data?.message || "설문 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (errorTemplate || !template) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-lg text-center p-6 shadow-md">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <CardHeader>
                    <CardTitle className="text-xl text-red-600">설문을 불러올 수 없습니다</CardTitle>
                    <CardDescription>
                        유효하지 않은 링크이거나, 설문이 삭제되었을 수 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => navigate('/')}>홈으로 돌아가기</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (isSubmitted) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-lg text-center p-8 shadow-lg">
                <Check className="w-16 h-16 mx-auto text-green-500 bg-green-100 rounded-full p-2" />
                <CardHeader>
                    <CardTitle className="mt-4 text-2xl font-bold">제출 완료!</CardTitle>
                    <CardDescription className="mt-2 text-gray-600">
                        소중한 의견을 남겨주셔서 감사합니다! <br/>
                        더 나은 서비스를 위해 최선을 다하겠습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => window.close()} className="w-full bg-blue-600 hover:bg-blue-700">
                        창 닫기
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-t-4 border-blue-600">
          <CardHeader className="text-center p-8 bg-white">
            <div className="mx-auto w-fit bg-blue-100 p-3 rounded-full mb-4">
                <PenSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{template.title}</h1>
            {template.description && <p className="text-gray-600 mt-2 max-w-prose mx-auto">{template.description}</p>}
          </CardHeader>
          
          <div className="p-6 bg-white">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-center text-gray-500 mt-2">{answeredCount} / {template.questions.length} 완료</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-6 sm:p-8 space-y-6">
               <Card className="p-6 shadow-sm">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                    <span className="text-blue-600 font-bold mr-2">이름</span>
                </Label>
                <Input {...register('userName')} placeholder="이름을 입력해주세요." className="text-base" />
                {errors.userName && <p className="text-sm text-red-500 mt-2">{errors.userName.message}</p>}
               </Card>
              {template.questions.map((question, index) => (
                <Card key={question.id} className="p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Controller
                    name={`answers.${index}`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div>
                        <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                           <span className="text-blue-600 font-bold mr-2">Q{index + 1}.</span>{question.text}
                        </Label>
                        {question.type === 'TEXTAREA' && (
                          <Textarea
                            placeholder="자유롭게 의견을 남겨주세요."
                            rows={5}
                            value={field.value?.answer || ''}
                            onChange={(e) => field.onChange({ questionId: question.id!, answer: e.target.value })}
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {question.type === 'TEXT' && (
                           <Textarea
                            placeholder="답변을 입력해주세요."
                            rows={2}
                            value={field.value?.answer || ''}
                            onChange={(e) => field.onChange({ questionId: question.id!, answer: e.target.value })}
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {question.type === 'MULTIPLE_CHOICE' && (
                           <div>
                            <RadioGroup
                                onValueChange={(value) => field.onChange({ questionId: question.id!, answer: value })}
                                className="grid grid-cols-2 md:grid-cols-5 gap-3"
                                value={field.value?.answer || ''}
                            >
                                {(question.options && question.options.length > 0 ? question.options : [
                                    { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }
                                ]).map((option) => {
                                    const labels: { [key: string]: { text: string; icon: React.ReactNode; color: string; selected: string } } = {
                                        '5': { text: '매우 만족', icon: <Smile size={28} />, color: 'text-green-500', selected: 'bg-green-100 border-green-500 text-green-700' },
                                        '4': { text: '만족', icon: <Smile size={28} />, color: 'text-lime-600', selected: 'bg-lime-100 border-lime-600 text-lime-700' },
                                        '3': { text: '보통', icon: <Meh size={28} />, color: 'text-yellow-500', selected: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
                                        '2': { text: '불만족', icon: <Frown size={28} />, color: 'text-orange-500', selected: 'bg-orange-100 border-orange-500 text-orange-700' },
                                        '1': { text: '매우 불만족', icon: <Frown size={28} />, color: 'text-red-500', selected: 'bg-red-100 border-red-500 text-red-700' },
                                    };
                                    const currentLabel = labels[option.value] || { text: option.value, icon: <Star size={28}/>, color: 'text-gray-500', selected: 'bg-blue-100 border-blue-500 text-blue-700' };
                                    const isSelected = field.value?.answer === option.value;

                                    return (
                                        <Label
                                            key={option.value}
                                            htmlFor={`${question.id}-${option.value}`}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all cursor-pointer space-y-2",
                                                "hover:border-blue-400 hover:bg-blue-50",
                                                isSelected ? currentLabel.selected : "bg-white border-gray-200 text-gray-600"
                                            )}
                                        >
                                            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} className="sr-only" />
                                            <div className={cn(!isSelected && currentLabel.color)}>{currentLabel.icon}</div>
                                            <span className="font-semibold text-center text-sm">{currentLabel.text}</span>
                                        </Label>
                                    )
                                })}
                            </RadioGroup>
                            {errors.answers?.[index] && (
                                <p className="text-sm text-red-500 mt-2 text-center">이 질문에 대한 답변이 필요합니다.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </Card>
              ))}
            </CardContent>
            <CardFooter className="p-6 sm:p-8 border-t bg-gray-50">
              <Button type="submit" className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '소중한 의견 제출하기'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        {!user && (
            <div className="mt-4 text-center text-sm text-gray-500">
                답변을 제출하려면 <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>로그인</Button>이 필요할 수 있습니다.
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentReviewFormPage; 