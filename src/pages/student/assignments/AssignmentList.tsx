import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: Date;
  submitted: boolean;
  score?: number;
  feedback?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const AssignmentList = () => {
  const assignments: Assignment[] = [
    {
      id: 1,
      title: '컴퓨터 비전 프로젝트 1',
      course: '컴퓨터 비전',
      dueDate: new Date(2024, 2, 15),
      submitted: true,
      score: 95,
      feedback: '잘 작성된 프로젝트입니다. 특히 이미지 처리 부분이 인상적입니다.'
    },
    {
      id: 2,
      title: '머신러닝 과제 2',
      course: '머신러닝',
      dueDate: new Date(2024, 2, 20),
      submitted: false
    },
    {
      id: 3,
      title: '딥러닝 프로젝트',
      course: '딥러닝',
      dueDate: new Date(2024, 3, 1),
      submitted: false
    },
  ];

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          과제 목록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
              className={`p-4 rounded-lg ${
                assignment.submitted
                  ? 'bg-green-50'
                  : isOverdue(assignment.dueDate)
                  ? 'bg-red-50'
                  : 'bg-blue-50'
              } hover:bg-opacity-80 transition-colors`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {assignment.submitted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isOverdue(assignment.dueDate) ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                    <h3 className="font-medium">{assignment.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{assignment.course}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={
                      isOverdue(assignment.dueDate) && !assignment.submitted
                        ? 'text-red-500'
                        : 'text-gray-600'
                    }>
                      {format(assignment.dueDate, 'PPP', { locale: ko })} 까지
                    </span>
                  </div>
                  {assignment.submitted && assignment.score !== undefined && (
                    <div className="text-sm text-green-600">
                      점수: {assignment.score}점
                    </div>
                  )}
                  {assignment.feedback && (
                    <p className="text-sm text-gray-600 mt-2">
                      {assignment.feedback}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={assignment.submitted ? "outline" : "default"}
                    size="sm"
                  >
                    {assignment.submitted ? '제출물 보기' : '과제 제출'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentList; 