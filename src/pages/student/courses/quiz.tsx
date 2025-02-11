import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Quiz, QuizAttempt } from '@/types/course';
import { toast } from 'sonner';
import { Timer, AlertCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/common/ui/progress';

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
      toast.error('퀴즈 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">퀴즈를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">해당 주차에 등록된 퀴즈가 없습니다.</p>
            <Button onClick={() => navigate(`/mycourse`)}>
              강의로 돌아가기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">퀴즈 결과</h2>
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}점</div>
              <p className="text-gray-600">
                통과 기준: {quiz.metadata.passingScore}점
                {score >= quiz.metadata.passingScore ? (
                  <span className="text-green-600 ml-2">통과!</span>
                ) : (
                  <span className="text-red-600 ml-2">미통과</span>
                )}
              </p>
            </div>
            <div className="space-y-6">
              {quiz.questions.map((question) => {
                const userAnswer = answers[question.id];
                const isCorrect = Array.isArray(question.correctAnswer)
                  ? JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
                  : userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className={`border rounded-lg p-6 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        제출한 답변: {Array.isArray(userAnswer) 
                          ? userAnswer.map(idx => question.choices[idx]).join(', ')
                          : question.choices[userAnswer as number]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600">
                          정답: {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.map(idx => question.choices[idx]).join(', ')
                            : question.choices[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">{question.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8">
              <Button onClick={() => navigate(`/mycourse`)} className="w-full">
                학습 페이지로 돌아가기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.quizTitle}</h2>
            <p className="text-gray-600 mb-6">{quiz.description}</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Timer className="w-5 h-5" />
                <span>제한 시간: {quiz.metadata.timeLimit}분</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5" />
                <span>통과 점수: {quiz.metadata.passingScore}점</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <AlertCircle className="w-5 h-5" />
                <span>총 {quiz.questions.length}문제</span>
              </div>
            </div>
            <Button onClick={handleStartQuiz} className="w-full">
              퀴즈 시작하기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정된 타이머 */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-3xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">남은 시간</span>
            <span className="text-sm font-medium text-gray-900">{formatTime(timeLeft)}</span>
          </div>
          <Progress 
            value={(timeLeft / (quiz.metadata.timeLimit * 60)) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="max-w-3xl mx-auto px-8 py-24">
        <Card className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-500">
              문제 {currentQuestionIndex + 1} / {quiz.questions.length}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
              >
                다음
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.type === 'single' && (
              <div className="space-y-4">
                {currentQuestion.choices.map((choice, choiceIndex) => (
                  <label
                    key={choiceIndex}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer
                      ${answers[currentQuestion.id] === choiceIndex 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={choiceIndex}
                      checked={answers[currentQuestion.id] === choiceIndex}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{choice}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiple' && (
              <div className="space-y-4">
                {currentQuestion.choices.map((choice, choiceIndex) => (
                  <label
                    key={choiceIndex}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer
                      ${Array.isArray(answers[currentQuestion.id]) && 
                        (answers[currentQuestion.id] as number[]).includes(choiceIndex)
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'}`}
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
                    <span className="text-gray-700">{choice}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? '제출 중...' : '퀴즈 제출하기'}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="w-full"
            >
              다음 문제
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default QuizPage; 