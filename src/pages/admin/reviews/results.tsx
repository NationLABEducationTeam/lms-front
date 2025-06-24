import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Progress } from '@/components/common/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common/ui/table';
import { ArrowLeft, Users, Star, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// 더미 데이터
const DUMMY_REVIEW_DETAILS = {
  id: 'review-001',
  title: 'MSA 기반 대규모 커머스 프로젝트 과정 후기',
  targetRespondents: 150,
  totalResponses: 128,
  overallAverageRating: 3.4,
  questions: [
    {
      id: 'q1', type: 'MULTIPLE_CHOICE', text: '강의 내용의 전반적인 만족도',
      distribution: [
        { score: 1, percent: 5 }, { score: 2, percent: 12 }, { score: 3, percent: 23 }, { score: 4, percent: 38 }, { score: 5, percent: 22 }
      ],
      average: 3.6
    },
    {
      id: 'q2', type: 'MULTIPLE_CHOICE', text: '강사님의 설명은 명확했나요?',
      distribution: [
        { score: 1, percent: 15 }, { score: 2, percent: 25 }, { score: 3, percent: 30 }, { score: 4, percent: 20 }, { score: 5, percent: 10 }
      ],
      average: 2.9
    },
    {
      id: 'q3', type: 'MULTIPLE_CHOICE', text: '실습 환경은 쾌적했나요?',
      distribution: [
        { score: 1, percent: 8 }, { score: 2, percent: 12 }, { score: 3, percent: 20 }, { score: 4, percent: 35 }, { score: 5, percent: 25 }
      ],
      average: 3.6
    },
    { id: 'q4', type: 'TEXTAREA', text: '강의에서 가장 좋았던 점은 무엇인가요?' },
    { id: 'q5', type: 'TEXTAREA', text: '강의에서 아쉬웠던 점이나 개선할 점이 있다면 알려주세요.' },
  ],
  textAnswers: [
      { questionId: 'q4', answer: '실제 MSA 아키텍처를 직접 구축해보는 경험이 가장 좋았습니다.' },
      { questionId: 'q4', answer: '강사님의 풍부한 실무 경험과 노하우가 큰 도움이 되었습니다.' },
      { questionId: 'q5', answer: '실습 시간이 조금 더 길었으면 좋겠습니다.' },
  ],
};

const getScoreColor = (score: number) => {
    const colors = [
        'bg-red-100 text-red-800', // 1
        'bg-orange-100 text-orange-800', // 2
        'bg-yellow-100 text-yellow-800', // 3
        'bg-green-100 text-green-800', // 4
        'bg-green-200 text-green-800'  // 5
    ];
    return colors[score - 1] || 'bg-gray-100';
};

const AdminReviewResultsPage: FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();

  const data = DUMMY_REVIEW_DETAILS;
  const completionRate = (data.totalResponses / data.targetRespondents) * 100;
  const ratingQuestions = data.questions.filter(q => q.type === 'MULTIPLE_CHOICE' || q.type === 'RATING');

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900 truncate">{data.title}</h1>
              <p className="text-gray-500">후기 결과 상세 분석</p>
            </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">응답률</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalResponses} / {data.targetRespondents} 명</div>
                    <Progress value={completionRate} className="mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">총 평균 점수</CardTitle>
                    <Star className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.overallAverageRating.toFixed(1)} / 5.0</div>
                    <p className="text-xs text-muted-foreground">모든 만족도/평가 질문 평균</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">총 주관식 답변</CardTitle>
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.textAnswers.length} 개</div>
                </CardContent>
            </Card>
        </div>

        {/* 질문별 분석 */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>만족도 및 평가 질문 분석</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        각 질문에 대한 1-5점 척도 응답 분포 및 평균 점수입니다.
                    </p>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">질문</TableHead>
                                    <TableHead className="text-center">1점</TableHead>
                                    <TableHead className="text-center">2점</TableHead>
                                    <TableHead className="text-center">3점</TableHead>
                                    <TableHead className="text-center">4점</TableHead>
                                    <TableHead className="text-center">5점</TableHead>
                                    <TableHead className="text-right">평균</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ratingQuestions.map((q) => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium">{q.text}</TableCell>
                                        {q.distribution?.map(d => (
                                            <TableCell key={d.score} className="text-center">
                                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${getScoreColor(d.score)}`}>
                                                    {d.percent}%
                                                </span>
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-bold">{q.average?.toFixed(1)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                   </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>주관식 답변</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>질문</TableHead>
                                <TableHead>답변</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.textAnswers.map((answer, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium w-1/3">{data.questions.find(q => q.id === answer.questionId)?.text}</TableCell>
                                    <TableCell>{answer.answer}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminReviewResultsPage;
