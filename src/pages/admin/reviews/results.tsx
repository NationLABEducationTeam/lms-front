import { FC, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { ArrowLeft, Users, Star, MessageSquare, AlertCircle, Loader2, MessageSquareText, User } from 'lucide-react';
import { useGetReviewTemplateQuery, useGetReviewResponsesQuery, ReviewQuestion } from '@/services/api/reviewApi';
import { cn } from '@/lib/utils';

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
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 truncate">{template.title}</h1>
                        <p className="text-gray-500 mt-1">후기 결과 상세 분석</p>
                    </div>
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
