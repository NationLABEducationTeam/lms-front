import React, { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import RootLayout from './components/common/layout/RootLayout';
import StudentDashboard from './pages/student/dashboard';
import StudentLanding from './pages/student';
import AuthForm from './components/auth/AuthForm';
import VerifyEmail from './components/auth/VerifyEmail';
import InstructorPage from './pages/instructor/index';
import AdminDashboard from './pages/admin/dashboard';
import AdminNotices from './pages/admin/notices';
import AdminNoticeCreate from './pages/admin/notices/create';
import AdminNoticeDetail from './pages/admin/notices/detail';
import AdminCourses from '@/pages/admin/courses';
import AdminStudents from './pages/admin/students';
import AdminSystem from './pages/admin/system';
import AdminStatistics from './pages/admin/statistics';
import AdminCertificates from './pages/admin/certificates';
import AdminBoards from './pages/admin/boards';
import AdminReviews from './pages/admin/reviews';
import NoticeList from './pages/student/board/NoticeList';
import NoticeDetail from './pages/student/board/NoticeDetail';
import CommunityList from './pages/student/board/CommunityList';
import CommunityCreate from './pages/student/board/CommunityCreate';
import CommunityDetail from './pages/student/board/CommunityDetail';
import QnaList from './pages/student/board/QnaList';
import QnaCreate from './pages/student/board/QnaCreate';
import QnaDetail from './pages/student/board/QnaDetail';
import CourseDetailPage from './pages/student/courses/detail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/common/layout/admin/AdminLayout';
import { UserRole } from './config/cognito';
import './App.css';
import StudentCoursesPage from '@/pages/student/courses';
import CorporatePage from '@/pages/corporate';
import CourseDetail from '@/pages/admin/courses/[id]';
import CreateCourse from '@/pages/admin/courses/create';
import EditCourse from '@/pages/admin/courses/[id]/edit';
import QuizPage from './pages/student/courses/quiz';
import QuizResults from './pages/admin/courses/quiz/results';
import VideoPlayerPage from '@/pages/student/courses/video';

const App = () => {
  console.log('🚀 Current Environment:', import.meta.env.VITE_ENV);
  console.log('🎯 API URL haha:', import.meta.env.VITE_API_URL);

  return (
    <HelmetProvider>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Corporate Page - No Layout */}
          <Route path="/corporate" element={<CorporatePage />} />

          {/* Admin Routes with AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/notices/create" element={<AdminNoticeCreate />} />
              <Route path="/admin/notices/:id" element={<AdminNoticeDetail />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/courses/create" element={<CreateCourse />} />
              <Route path="/admin/courses/:id" element={<CourseDetail />} />
              <Route path="/admin/courses/:id/edit" element={<EditCourse />} />
              <Route path="/admin/courses/:courseId/quiz/:quizId/results" element={<QuizResults />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/system" element={<AdminSystem />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/boards" element={<AdminBoards />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
            </Route>
          </Route>

          {/* Student/Instructor Routes with RootLayout */}
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<StudentLanding />} />
            <Route path="/courses" element={<StudentCoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            
            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/mycourse" element={<StudentCoursesPage />} />
              <Route path="/mycourse/:courseId/week/:weekId/quiz" element={<QuizPage />} />
              <Route path="/mycourse/:courseId/quiz/:quizFileName" element={<QuizPage />} />
              <Route path="/mycourse/:courseId/week/:weekId/video/:videoId" element={<VideoPlayerPage />} />
              <Route path="/notices" element={<NoticeList />} />
              <Route path="/notices/:id" element={<NoticeDetail />} />
              <Route path="/community" element={<CommunityList />} />
              <Route path="/community/create" element={<CommunityCreate />} />
              <Route path="/community/:id" element={<CommunityDetail />} />
              <Route path="/qna" element={<QnaList />} />
              <Route path="/qna/create" element={<QnaCreate />} />
              <Route path="/qna/:id" element={<QnaDetail />} />
            </Route>

            {/* Protected Instructor Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR]} />}>
              <Route path="/instructor" element={<InstructorPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;