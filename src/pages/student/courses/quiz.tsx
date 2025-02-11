import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Quiz, QuizAttempt } from '@/types/course';
import { toast } from 'sonner';
import { Timer, AlertCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/common/ui/progress';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/common/ui/alert-dialog';

const QuizPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: number | number[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingNavigationIndex, setPendingNavigationIndex] = useState<number | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // location.state에서 퀴즈 데이터 가져오기
  useEffect(() => {
    if (location.state?.quizData) {
      setQuiz(location.state.quizData);
    }
  }, [location.state]);

  // 타이머 관리
  useEffect(() => {
    if (quiz?.metadata.timeLimit && currentAttempt) {
      const timer = setInterval(() => {
        const startTime = new Date(currentAttempt.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = (quiz.metadata.timeLimit * 60) - elapsed;

        if (remaining <= 0) {
          clearInterval(timer);
          handleSubmit(true);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, currentAttempt]);

  const handleStartQuiz = () => {
    if (!quiz) return;

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      quizId: 'quiz-1',
      userId: 'current-user-id',
      startTime: new Date().toISOString(),
      answers: [],
      status: 'IN_PROGRESS'
    };

    setCurrentAttempt(attempt);
    setTimeLeft(quiz.metadata.timeLimit * 60);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerChange = (questionId: number, answer: number | number[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = Array.isArray(question.correctAnswer)
        ? JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
        : userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
    });
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  const handleSubmit = async (isTimeout: boolean = false) => {
    if (!quiz || !currentAttempt) return;

    // 모든 문제에 답변했는지 확인
    const unansweredQuestions = quiz.questions.filter(q => answers[q.id] === undefined);
    const flaggedUnansweredQuestions = unansweredQuestions.filter(
      (_, index) => flaggedQuestions.has(index)
    );

    if (unansweredQuestions.length > 0) {
      if (!isTimeout) {
        toast.error(`아직 답변하지 않은 문항이 ${unansweredQuestions.length}개 있습니다.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));

      const updatedAttempt: QuizAttempt = {
        ...currentAttempt,
        endTime: new Date().toISOString(),
        answers: answersArray,
        status: isTimeout ? 'TIMED_OUT' : 'COMPLETED'
      };

      const finalScore = calculateScore();
      setScore(finalScore);
      setCurrentAttempt(updatedAttempt);
      setShowResults(true);
      
      if (isTimeout) {
        toast.warning('시간이 초과되어 자동으로 제출되었습니다.');
      } else {
        toast.success('퀴즈가 성공적으로 제출되었습니다.');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('퀴즈 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionNavigation = (targetIndex: number) => {
    if (answers[currentQuestion.id] === undefined) {
      setPendingNavigationIndex(targetIndex);
      setShowWarningDialog(true);
      return;
    }
    setCurrentQuestionIndex(targetIndex);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (answers[currentQuestion.id] === undefined) {
      setPendingNavigationIndex(currentQuestionIndex + 1);
      setShowWarningDialog(true);
      return;
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (answers[currentQuestion.id] === undefined) {
      setPendingNavigationIndex(currentQuestionIndex - 1);
      setShowWarningDialog(true);
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleWarningConfirm = () => {
    if (pendingNavigationIndex !== null) {
      setCurrentQuestionIndex(pendingNavigationIndex);
      setPendingNavigationIndex(null);
    }
    setShowWarningDialog(false);
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newFlags = new Set(prev);
      newFlags.add(questionId);
      return newFlags;
    });
    if (pendingNavigationIndex !== null) {
      setCurrentQuestionIndex(pendingNavigationIndex);
      setPendingNavigationIndex(null);
    }
    setShowWarningDialog(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">퀴즈를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">해당 주차에 등록된 퀴즈가 없습니다.</p>
            <Button 
              onClick={() => navigate(`/mycourse`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              강의로 돌아가기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // 상단 타이머 바 컴포넌트
  const TimerBar = () => (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-md z-10">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">제한 시간:</span>
              <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg tabular-nums">
                {currentAttempt ? formatTime(timeLeft) : `${quiz.metadata.timeLimit}:00`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {currentAttempt ? '진행 상황:' : '총 문제:'}
            </span>
            <span className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {currentAttempt ? `${currentQuestionIndex + 1} / ${quiz.questions.length}` : `${quiz.questions.length}문제`}
            </span>
          </div>
        </div>
        {currentAttempt && (
          <>
            <div className="relative w-full h-2 bg-blue-100 rounded-full overflow-hidden mt-2">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                  timeLeft < 60 ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${(timeLeft / (quiz.metadata.timeLimit * 60)) * 100}%` }}
              />
            </div>
            {timeLeft < 60 && (
              <p className="text-red-600 text-sm mt-1 animate-pulse">
                ⚠️ 시간이 1분 미만 남았습니다!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <TimerBar />
        <div className="max-w-3xl mx-auto pt-20">
          <Card className="p-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">퀴즈 결과</h2>
              <div className={`text-5xl font-bold mb-4 ${
                score >= quiz.metadata.passingScore 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {score}점
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                score >= quiz.metadata.passingScore
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                통과 기준: {quiz.metadata.passingScore}점
                {score >= quiz.metadata.passingScore ? (
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                ) : (
                  <XCircle className="w-5 h-5 ml-2" />
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {quiz.questions.map((question) => {
                const userAnswer = answers[question.id];
                const isCorrect = Array.isArray(question.correctAnswer)
                  ? JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
                  : userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} 
                    className={`rounded-lg p-6 transition-all ${
                      isCorrect 
                        ? 'bg-green-50/50 border border-green-200 shadow-sm' 
                        : 'bg-red-50/50 border border-red-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        제출한 답변: {Array.isArray(userAnswer) 
                          ? userAnswer.map(idx => question.choices[idx]).join(', ')
                          : question.choices[userAnswer as number]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm font-medium text-green-600">
                          정답: {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.map(idx => question.choices[idx]).join(', ')
                            : question.choices[question.correctAnswer]}
                        </p>
                      )}
                      {!isCorrect && question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button 
              onClick={() => navigate(`/mycourse`)} 
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              학습 페이지로 돌아가기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <TimerBar />
        <div className="max-w-3xl mx-auto pt-20">
          <Card className="p-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.quizTitle}</h2>
            <p className="text-gray-600 mb-6">{quiz.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                <Timer className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">제한 시간</p>
                  <p className="text-lg font-semibold text-blue-700">{quiz.metadata.timeLimit}분</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">통과 점수</p>
                  <p className="text-lg font-semibold text-green-700">{quiz.metadata.passingScore}점</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">문제 수</p>
                  <p className="text-lg font-semibold text-purple-700">{quiz.questions.length}문제</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleStartQuiz} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              퀴즈 시작하기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TimerBar />
      {/* 문제 영역 */}
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Card className="mb-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.question}</h2>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600 tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {currentQuestion.type === 'single' && (
                currentQuestion.choices.map((choice, choiceIndex) => (
                  <label
                    key={choiceIndex}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${answers[currentQuestion.id] === choiceIndex 
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-offset-2' 
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={choiceIndex}
                      checked={answers[currentQuestion.id] === choiceIndex}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 flex-1">{choice}</span>
                  </label>
                ))
              )}

              {currentQuestion.type === 'multiple' && (
                currentQuestion.choices.map((choice, choiceIndex) => (
                  <label
                    key={choiceIndex}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${Array.isArray(answers[currentQuestion.id]) && 
                        (answers[currentQuestion.id] as number[]).includes(choiceIndex)
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 ring-offset-2' 
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'}`}
                  >
                    <input
                      type="checkbox"
                      value={choiceIndex}
                      checked={Array.isArray(answers[currentQuestion.id]) && 
                        (answers[currentQuestion.id] as number[]).includes(choiceIndex)}
                      onChange={(e) => {
                        const currentAnswers = (answers[currentQuestion.id] as number[]) || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, choiceIndex]
                          : currentAnswers.filter(a => a !== choiceIndex);
                        handleAnswerChange(currentQuestion.id, newAnswers);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 flex-1">{choice}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* 하단 네비게이션 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-lg border-t z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="min-w-[100px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>

            <div className="flex-1 px-4">
              <div className="flex justify-center gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white'
                        : answers[index] !== undefined
                        ? 'bg-blue-100 text-blue-600'
                        : flaggedQuestions.has(index)
                        ? 'bg-red-100 text-red-600 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="min-w-[100px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? '제출 중...' : '제출'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* 경고 다이얼로그 */}
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent className="bg-white shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                미답변 문항 표시
              </AlertDialogTitle>
              <div className="mt-2">
                <div className="text-base text-gray-700 mb-2">
                  현재 문제를 나중에 다시 검토하시겠습니까?
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm text-amber-800">
                    💡 미답변으로 표시된 문항은 상단에서 빨간색으로 표시되어 쉽게 찾아볼 수 있습니다.
                  </div>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white hover:bg-gray-50 border-2 border-gray-200">
                현재 문항 계속 풀기
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleFlagQuestion(currentQuestion.id);
                  handleWarningConfirm();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                나중에 다시 검토하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default QuizPage; 