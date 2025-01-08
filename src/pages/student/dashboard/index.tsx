import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories, fetchSubCategories, fetchCoursesByCategory, clearCourses } from '@/store/features/courses/coursesSlice';
import { CourseList } from '@/components/courses/CourseList';
import { TodoCalendar } from '../calendar/TodoCalendar';
import AssignmentList from '../assignments/AssignmentList';
import { BoardTabs } from '@/components/board/BoardTabs';
import MyNote from '../note/Mynote';
import DashboardLayout from '@/components/common/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { BookOpen, FileText, BrainCircuit, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const StudentDashboard: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, courses, loading, error } = useSelector((state: RootState) => state.courses);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        dispatch(clearCourses());
        
        const categoriesResult = await dispatch(fetchCategories()).unwrap();
        console.log('Loaded categories:', categoriesResult);
        
        for (const category of categoriesResult) {
          const subCatsResult = await dispatch(fetchSubCategories(category.path)).unwrap();
          console.log(`Loaded sub categories for ${category.name}:`, subCatsResult);
          
          for (const subCat of subCatsResult) {
            await dispatch(fetchCoursesByCategory({
              mainCategory: category.path,
              subCategory: subCat.name
            })).unwrap();
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };

    loadCourses();
  }, [dispatch]);

  const handleJoinClass = (coursePath: string) => {
    // TODO: 강의실 입장 로직 구현
    console.log('Joining class:', coursePath);
  };

  const handlePostClick = (boardType: 'notice' | 'community' | 'qna', postId: string) => {
    switch (boardType) {
      case 'notice':
        navigate(`/student/notices/${postId}`);
        break;
      case 'community':
        navigate(`/student/community/${postId}`);
        break;
      case 'qna':
        navigate(`/student/qna/${postId}`);
        break;
    }
  };

  const handleCreateClick = (boardType: 'community' | 'qna') => {
    switch (boardType) {
      case 'community':
        navigate('/student/community/create');
        break;
      case 'qna':
        navigate('/student/qna/create');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <DashboardLayout title="Nations LAB LMS">
      <div className="space-y-8">
        {/* 상단 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  내 강의
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-gray-500">
                  전체 진도율 65%
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  완료한 과제
                </CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/12</div>
                <p className="text-xs text-gray-500">
                  이번 주 마감 2개
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  퀴즈 평균 점수
                </CardTitle>
                <BrainCircuit className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92점</div>
                <p className="text-xs text-gray-500">
                  지난 주 대비 +5점
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  다가오는 일정
                </CardTitle>
                <Calendar className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-gray-500">
                  이번 주 3개
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 탭 섹션 */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">내 강의</TabsTrigger>
            <TabsTrigger value="assignments">과제</TabsTrigger>
            <TabsTrigger value="calendar">일정</TabsTrigger>
            <TabsTrigger value="board">게시판</TabsTrigger>
            <TabsTrigger value="chat">나만의 노트</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <CourseList
              courses={courses}
              userRole="STUDENT"
              onJoinClass={handleJoinClass}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <AssignmentList />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <TodoCalendar />
          </TabsContent>

          <TabsContent value="board" className="space-y-4">
            <BoardTabs 
              onPostClick={handlePostClick}
              onCreateClick={handleCreateClick}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <MyNote />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard; 