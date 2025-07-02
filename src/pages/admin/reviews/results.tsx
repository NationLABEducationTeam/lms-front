import { FC, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { ArrowLeft, Users, Star, MessageSquare, AlertCircle, Loader2, MessageSquareText, User, Download } from 'lucide-react';
import { useGetReviewTemplateQuery, useGetReviewResponsesQuery, ReviewQuestion } from '@/services/api/reviewApi';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const scoreMap: { [key: string]: number } = {
    '매우 만족': 5,
    '만족': 4,
    '보통': 3,
    '불만족': 2,
    '매우 불만족': 1,
};

// 숫자 문자열도 처리하기 위해 추가
for (let i = 1; i <= 5; i++) {
    scoreMap[i.toString()] = i;
}

const scoreRgbColors: { [key: number]: string } = {
    1: '239, 68, 68',   // red-500
    2: '249, 115, 22',  // orange-500
    3: '234, 179, 8',   // yellow-500
    4: '132, 204, 22',  // lime-500
    5: '34, 197, 94',   // green-500
};

const calculateAnalytics = (questions: ReviewQuestion[], responses: any[]) => {
    if (!responses || responses.length === 0) {
        return { ratingQuestions: [], groupedTextAnswers: [], totalResponses: 0, overallAverage: 0, totalTextAnswers: 0 };
    }

    const ratingQuestions: any[] = [];
    let totalRatingSum = 0;
    let totalRatingCount = 0;

    const textAnswerGroups: { [key: string]: { questionId: string; questionText: string; answers: { user: string; answer: string }[] } } = {};
    questions.forEach(q => {
        if (q.type === 'TEXT' || q.type === 'TEXTAREA') {
            textAnswerGroups[q.id!] = { questionId: q.id!, questionText: q.text, answers: [] };
        }
    });

    // 질문 ID 맵 생성 (템플릿의 원래 질문 ID와 인덱스를 매핑)
    const questionIdToIndexMap = new Map(questions.map((q, index) => [q.id, index]));

    responses.forEach(res => {
        res.answers.forEach((answerObj: any, answerIndex: number) => {
            // 답변의 questionId 대신, 답변의 순서(index)를 사용해 원본 질문을 찾음
            const originalQuestion = questions[answerIndex];
            if (!originalQuestion) return;

            if (originalQuestion.type === 'MULTIPLE_CHOICE') {
                const rating = scoreMap[answerObj.answer];
                if (rating) {
                    let ratingQuestion = ratingQuestions.find(rq => rq.id === originalQuestion.id);
                    if (!ratingQuestion) {
                        ratingQuestion = { ...originalQuestion, distributionNum: [0, 0, 0, 0, 0], questionSum: 0, questionResponseCount: 0 };
                        ratingQuestions.push(ratingQuestion);
                    }
                    ratingQuestion.distributionNum[rating - 1]++;
                    ratingQuestion.questionSum += rating;
                    ratingQuestion.questionResponseCount++;
                }
            } else if ((originalQuestion.type === 'TEXT' || originalQuestion.type === 'TEXTAREA') && answerObj.answer) {
                 textAnswerGroups[originalQuestion.id!].answers.push({
                    user: res.userName || res.user_id || '익명',
                    answer: answerObj.answer,
                });
            }
        });
    });
    
    ratingQuestions.forEach(rq => {
        rq.average = rq.questionResponseCount > 0 ? rq.questionSum / rq.questionResponseCount : 0;
        rq.distribution = rq.distributionNum.map((count: number) => 
            rq.questionResponseCount > 0 ? (count / rq.questionResponseCount) * 100 : 0
        );
        totalRatingSum += rq.questionSum;
        totalRatingCount += rq.questionResponseCount;
    });

    const overallAverage = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;
    const groupedTextAnswers = Object.values(textAnswerGroups).filter(group => group.answers.length > 0);
    const totalTextAnswers = groupedTextAnswers.reduce((acc, group) => acc + group.answers.length, 0);

    return { ratingQuestions, groupedTextAnswers, totalResponses: responses.length, overallAverage, totalTextAnswers };
};

const AnalyticsCard: FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const AdminReviewResultsPage: FC = () => {
    const { reviewId } = useParams<{ reviewId: string }>();
    const navigate = useNavigate();

    const { data: template, isLoading: isLoadingTemplate, error: errorTemplate } = useGetReviewTemplateQuery(reviewId!, { skip: !reviewId });
    const { data: responses, isLoading: isLoadingResponses, error: errorResponses } = useGetReviewResponsesQuery(reviewId!, { skip: !reviewId });

    const analytics = useMemo(() => {
        if (!template || !responses) return { ratingQuestions: [], groupedTextAnswers: [], totalResponses: 0, overallAverage: 0, totalTextAnswers: 0 };
        return calculateAnalytics(template.questions, responses);
    }, [template, responses]);

    // 엑셀 다운로드 함수
    const downloadExcel = () => {
        if (!template || !responses || responses.length === 0) {
            toast.error('다운로드할 데이터가 없습니다.');
            return;
        }

        // 워크북 생성
        const wb = XLSX.utils.book_new();

        // 1. 요약 시트 생성
        const summaryData = [
            ['설문 제목', template.title],
            ['설문 설명', template.description || ''],
            ['목표 응답자 수', template.targetRespondents || 'N/A'],
            ['실제 응답자 수', responses.length],
            ['전체 평균 점수', analytics.overallAverage.toFixed(2)],
            [''],
            ['생성일', new Date(template.createdAt).toLocaleDateString('ko-KR')],
            ['수정일', new Date(template.updatedAt).toLocaleDateString('ko-KR')],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, '요약');

        // 2. 전체 응답 시트 생성
        const responseHeaders = ['응답자', '제출 시간'];
        template.questions.forEach(q => {
            responseHeaders.push(q.text);
        });

        const responseData = [responseHeaders];
        responses.forEach(res => {
            const row = [
                res.userName || '익명',
                new Date(res.submittedAt).toLocaleString('ko-KR')
            ];
            
            // 질문 순서대로 답변 추가
            template.questions.forEach((q, qIndex) => {
                const answer = res.answers[qIndex];
                row.push(answer ? answer.answer : '');
            });
            
            responseData.push(row);
        });

        const responseSheet = XLSX.utils.aoa_to_sheet(responseData);
        XLSX.utils.book_append_sheet(wb, responseSheet, '전체 응답');

        // 3. 만족도 분석 시트 (만족도 질문이 있는 경우)
        if (analytics.ratingQuestions.length > 0) {
            const ratingHeaders = ['질문', '1점', '2점', '3점', '4점', '5점', '평균'];
            const ratingData = [ratingHeaders];
            
            analytics.ratingQuestions.forEach(q => {
                const row = [
                    q.text,
                    `${q.distributionNum[0]}명 (${q.distribution[0].toFixed(1)}%)`,
                    `${q.distributionNum[1]}명 (${q.distribution[1].toFixed(1)}%)`,
                    `${q.distributionNum[2]}명 (${q.distribution[2].toFixed(1)}%)`,
                    `${q.distributionNum[3]}명 (${q.distribution[3].toFixed(1)}%)`,
                    `${q.distributionNum[4]}명 (${q.distribution[4].toFixed(1)}%)`,
                    q.average.toFixed(2)
                ];
                ratingData.push(row);
            });
            
            const ratingSheet = XLSX.utils.aoa_to_sheet(ratingData);
            XLSX.utils.book_append_sheet(wb, ratingSheet, '만족도 분석');
        }

        // 4. 주관식 답변 시트 (주관식 질문이 있는 경우)
        if (analytics.groupedTextAnswers.length > 0) {
            analytics.groupedTextAnswers.forEach((group, index) => {
                const textData = [
                    ['질문', group.questionText],
                    [''],
                    ['응답자', '답변']
                ];
                
                group.answers.forEach(answer => {
                    textData.push([answer.user, answer.answer]);
                });
                
                const textSheet = XLSX.utils.aoa_to_sheet(textData);
                const sheetName = `주관식${index + 1}`;
                XLSX.utils.book_append_sheet(wb, textSheet, sheetName.substring(0, 31)); // 시트 이름은 31자 제한
            });
        }

        // 파일 다운로드
        const fileName = `${template.title}_응답결과_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('엑셀 파일이 다운로드되었습니다.');
    };

    const isLoading = isLoadingTemplate || isLoadingResponses;
    const error = errorTemplate || errorResponses;
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex justify-center items-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }
    
    if (error || !template) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex justify-center items-center">
                 <Card className="w-full max-w-lg text-center p-6">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                    <CardHeader>
                        <CardTitle className="text-xl text-red-600">오류 발생</CardTitle>
                        <CardDescription>
                            데이터를 불러오는 중 문제가 발생했거나, 설문이 존재하지 않습니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => navigate('/admin/reviews')}>목록으로 돌아가기</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/admin/reviews')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 truncate">{template.title}</h1>
                        <p className="text-gray-500 mt-1">후기 결과 상세 분석</p>
                    </div>
                    <Button 
                        onClick={downloadExcel}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={!responses || responses.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        엑셀 다운로드
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <AnalyticsCard
                        title="총 응답 수"
                        value={`${analytics.totalResponses} / ${template.targetRespondents || 'N/A'}`}
                        icon={<Users className="w-5 h-5 text-muted-foreground" />}
                    />
                    <AnalyticsCard
                        title="전체 평균 점수"
                        value={`${analytics.overallAverage.toFixed(2)} / 5.0`}
                        icon={<Star className="w-5 h-5 text-muted-foreground" />}
                    />
                    <AnalyticsCard
                        title="주관식 답변 수"
                        value={`${analytics.totalTextAnswers} 개`}
                        icon={<MessageSquare className="w-5 h-5 text-muted-foreground" />}
                    />
                </div>

                {analytics.ratingQuestions.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>만족도 질문 분석</CardTitle>
                            <CardDescription>각 질문에 대한 1-5점 척도 응답 분포 및 평균 점수입니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-2/5 font-bold">질문</TableHead>
                                            <TableHead className="text-center font-bold">1점</TableHead>
                                            <TableHead className="text-center font-bold">2점</TableHead>
                                            <TableHead className="text-center font-bold">3점</TableHead>
                                            <TableHead className="text-center font-bold">4점</TableHead>
                                            <TableHead className="text-center font-bold">5점</TableHead>
                                            <TableHead className="text-right font-bold">평균</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.ratingQuestions.map((q) => (
                                            <TableRow key={q.id}>
                                                <TableCell className="font-medium">{q.text}</TableCell>
                                                {q.distribution.map((percent: number, index: number) => (
                                                    <TableCell 
                                                        key={index} 
                                                        className="text-center font-semibold transition-colors"
                                                        style={{ 
                                                            backgroundColor: `rgba(${scoreRgbColors[index + 1]}, ${percent / 100})`,
                                                            color: percent > 45 ? 'white' : 'inherit'
                                                        }}
                                                    >
                                                        {percent.toFixed(0)}%
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right font-bold text-lg">{q.average.toFixed(1)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                        </div>
                        </CardContent>
                    </Card>
                )}

                {analytics.groupedTextAnswers.length > 0 && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>주관식 답변 모음</CardTitle>
                            <CardDescription>질문 탭을 클릭하여 해당 질문에 대한 답변만 모아볼 수 있습니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={analytics.groupedTextAnswers[0].questionId} className="w-full">
                                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-1 h-auto rounded-lg bg-blue-50">
                                    {analytics.groupedTextAnswers.map((group) => (
                                        <TabsTrigger 
                                            key={group.questionId} 
                                            value={group.questionId} 
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md px-4 py-2 transition-all duration-200"
                                        >
                                            <span className="truncate">{group.questionText}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {analytics.groupedTextAnswers.map((group) => (
                                    <TabsContent key={group.questionId} value={group.questionId} className="mt-6">
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                                            {group.answers.length > 0 ? (
                                                group.answers.map((answer, index) => (
                                                    <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                          <MessageSquareText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                          <p className="text-gray-800 text-base">{answer.answer}</p>
                                                          <div className="flex items-center justify-end mt-3 text-gray-500">
                                                            <User className="w-4 h-4 mr-1.5" />
                                                            <p className="text-sm font-medium">{answer.user}</p>
                                                          </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12 text-gray-500">
                                                    <p>이 질문에 대한 답변이 없습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminReviewResultsPage;
