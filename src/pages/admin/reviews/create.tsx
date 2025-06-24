import { FC, useState, ChangeEvent } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Plus, Trash2, GripVertical, ArrowLeft, Upload, Info } from 'lucide-react';
import { Textarea } from '@/components/common/ui/textarea';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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
  targetRespondents: z.number().min(0, '목표 인원은 0명 이상이어야 합니다.').optional(),
  questions: z.array(questionSchema),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const AdminCreateReviewPage: FC = () => {
  const navigate = useNavigate();
  
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: '',
      courseId: '',
      targetRespondents: 0,
      questions: [
        { text: '', type: 'TEXT' }
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  // 드래그 앤 드롭 핸들러
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index !== result.destination.index) {
      move(result.source.index, result.destination.index);
    }
  };

  // 안전하게 고유 id 생성
  const genId = () => String(Date.now()) + Math.random().toString(36).slice(2);

  // append 시 항상 id 부여
  const handleAppend = () => {
    append({ text: '', type: 'TEXT', id: genId() });
  };

  const onSubmit = (data: ReviewFormValues) => {
    console.log(data);
    toast.success("폼이 성공적으로 저장되었습니다 (콘솔 확인).");
    // TODO: API 연동
  };

  const handleExcelUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: ["order", "text", "type"] });
        
        const categoryMap: { [key: string]: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' } = {
          '단답형': 'TEXT',
          '장문형': 'TEXTAREA',
          '만족도': 'MULTIPLE_CHOICE',
        };

        const newQuestions = json.slice(1).map((row: any) => {
          const type = categoryMap[row.type] || 'TEXT';
          return { text: row.text, type, id: genId() };
        });

        append(newQuestions);
        toast.success(`${newQuestions.length}개의 질문이 추가되었습니다.`);
      } catch (error) {
        console.error("엑셀 파일 처리 중 오류 발생:", error);
        toast.error("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  // 더미 데이터
  const DUMMY_COURSES = [
      { id: 'course-123', title: 'MSA 기반 대규모 커머스 프로젝트' },
      { id: 'course-456', title: '쿠버네티스 마스터 클래스' },
  ];

  return (
    <div className="p-8 bg-white min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        {/* 헤더 */}
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
              <h1 className="text-2xl font-bold text-gray-900">새 후기 폼 만들기</h1>
              <p className="text-gray-500">학생들에게 발송할 후기 폼을 생성합니다.</p>
            </div>
        </div>

        {/* 기본 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">폼 제목</label>
              <Input {...register('title')} placeholder="예: 쿠버네티스 과정 만족도 조사" />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연결된 강의</label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="후기를 받을 강의를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_COURSES.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseId && <p className="text-sm text-red-500 mt-1">{errors.courseId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">목표 인원 (선택 사항)</label>
              <Input 
                type="number" 
                {...register('targetRespondents', { valueAsNumber: true })} 
                placeholder="후기를 받을 목표 인원 수를 입력하세요" 
              />
              {errors.targetRespondents && <p className="text-sm text-red-500 mt-1">{errors.targetRespondents.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 질문 목록 */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>질문 목록</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('excel-upload')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    엑셀로 가져오기
                </Button>
                <input type="file" id="excel-upload" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelUpload} />
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 엑셀 업로드 안내 박스 */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2 mb-2 md:mb-0">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-800 font-semibold">엑셀 업로드 지원 안내</span>
                  </div>
                  <div className="flex-1 text-xs text-gray-700">
                    <div className="mb-1">지원 카테고리: <b>단답형</b>, <b>장문형</b>, <b>만족도</b>(5점 척도)</div>
                    <div className="mb-1">아래 예시와 같은 양식으로 업로드하세요.</div>
                    <div className="overflow-x-auto">
                      <table className="text-xs border mt-1 bg-white">
                        <thead>
                          <tr>
                            <th className="border px-2">순번</th>
                            <th className="border px-2">문항내용</th>
                            <th className="border px-2">카테고리</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2">1</td>
                            <td className="border px-2">강의 내용에 만족하시나요?</td>
                            <td className="border px-2">만족도</td>
                          </tr>
                          <tr>
                            <td className="border px-2">2</td>
                            <td className="border px-2">강사님의 설명은 명확했나요?</td>
                            <td className="border px-2">만족도</td>
                          </tr>
                          <tr>
                            <td className="border px-2">3</td>
                            <td className="border px-2">강의에서 가장 좋았던 점은?</td>
                            <td className="border px-2">장문형</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* 질문 리스트 및 추가 버튼 */}
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="questions-droppable">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {fields.map((field, index) => {
                          const questionType = watch(`questions.${index}.type`);
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 border rounded-lg bg-gray-50 space-y-4 mb-2 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span {...provided.dragHandleProps} className="cursor-grab text-gray-400">
                                      <GripVertical />
                                    </span>
                                    <p className="font-semibold flex-1">질문 {index + 1}</p>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                      <Trash2 className="w-4 h-4 text-red-500"/>
                                    </Button>
                                  </div>
                                  <Controller
                                    name={`questions.${index}.type`}
                                    control={control}
                                    render={({ field: typeField }) => (
                                      <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                        <SelectTrigger className="bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 shadow-sm">
                                          <SelectValue placeholder="질문 유형 선택" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                          <SelectItem value="TEXT" className="hover:bg-blue-50 data-[state=checked]:text-blue-600">단답형</SelectItem>
                                          <SelectItem value="TEXTAREA" className="hover:bg-blue-50 data-[state=checked]:text-blue-600">장문형</SelectItem>
                                          <SelectItem value="MULTIPLE_CHOICE" className="hover:bg-blue-50 data-[state=checked]:text-blue-600">만족도 (5점 척도)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  <Textarea {...register(`questions.${index}.text`)} placeholder="질문 내용을 입력하세요. 예: 강의 내용에 만족하시나요?" />
                                  {errors.questions?.[index]?.text && <p className="text-sm text-red-500 mt-1">{errors.questions?.[index]?.text?.message}</p>}
                                  {questionType === 'MULTIPLE_CHOICE' && (
                                    <div className="mt-2 p-3 bg-white rounded-md border">
                                      <p className="text-sm font-semibold text-gray-700 mb-2">응답 선택지 (고정)</p>
                                      <div className="space-y-1 text-sm text-gray-800">
                                        <div>1. 매우 불만족</div>
                                        <div>2. 불만족</div>
                                        <div>3. 보통</div>
                                        <div>4. 만족</div>
                                        <div>5. 매우 만족</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <Button type="button" variant="outline" className="w-full mt-4" onClick={handleAppend}>
                    <Plus className="w-4 h-4 mr-2" />
                    질문 추가하기
                </Button>
            </CardContent>
        </Card>
        
        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">저장하기</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateReviewPage;
