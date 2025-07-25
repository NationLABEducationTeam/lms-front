import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast-custom.css';
import RootLayout from './components/common/layout/RootLayout';
import StudentDashboard from './pages/student/dashboard';
import StudentLanding from './pages/student';
import AuthForm from './components/auth/AuthForm';
import VerifyEmail from './components/auth/VerifyEmail';
import AdminDashboard from './pages/admin/dashboard';
import AdminBoard from './pages/admin/notices';
import AdminNoticeCreate from './pages/admin/notices/create';
import AdminPostDetail from "./pages/admin/notices/post-detail";
import AdminCourses from '@/pages/admin/courses';
import AdminStudents from './pages/admin/students';
import AdminStudentDetail from './pages/admin/students/detail';
import AdminStatistics from './pages/admin/statistics';
import AdminCertificates from './pages/admin/certificates';
import AdminBoards from './pages/admin/boards';
import AdminMonitoring from './pages/admin/monitoring';
import AdminReviewsPage from './pages/admin/reviews';
import AdminCreateReviewPage from './pages/admin/reviews/create';
import AdminReviewResultsPage from './pages/admin/reviews/results';
import AdminEditReviewPage from './pages/admin/reviews/[id]/edit';
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
import DeepCodingPage from '@/pages/deepcoding';
import CourseDetail from '@/pages/admin/courses/[id]';
import CreateCourse from '@/pages/admin/courses/create';
import EditCourse from '@/pages/admin/courses/[id]/edit';
import QuizPage from './pages/student/courses/quiz';
import QuizResults from './pages/admin/courses/quiz/results';
import VideoPlayerPage from '@/pages/student/courses/video';
import ProblemListPage from '@/pages/deepcoding/problems/list';
import ProblemDetailPage from '@/pages/deepcoding/problems/detail';
import AssignmentListPage from '@/pages/student/assignments';
import AssignmentDetailPage from '@/pages/student/assignments/detail';
import CourseAssignmentsPage from '@/pages/admin/courses/assignments';
import SubmissionsPage from '@/pages/admin/courses/assignments/submissions/[assignmentId]';
import SubmissionDetailPage from '@/pages/admin/courses/assignments/submission/[submissionId]';
import WishlistPage from './pages/student/wishlist';
import CartPage from './pages/student/cart';
import PendingCoursesPage from './pages/student/pending-courses';
import CourseEnrollmentsPage from './pages/admin/courses/[id]/enrollments';
import StudentReviewFormPage from './pages/student/reviews/[id]';

// Vite 환경 변수 타입 확장
declare global {
  interface ImportMeta {
    env: {
      VITE_ENV: string;
      VITE_API_URL: string;
      [key: string]: string;
    };
  }
}

const App = () => {
  console.log('🚀 Current Environment:', import.meta.env.VITE_ENV);
  console.log('🎯 API URL haha:', import.meta.env.VITE_API_URL);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Pages (No Layout) */}
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/corporate" element={<CorporatePage />} />
          <Route path="/reviews/:id" element={<StudentReviewFormPage />} />
          
          {/* DeepCoding Page - No Layout */}
          <Route path="/deepcoding" element={<DeepCodingPage />} />
          <Route path="/deepcoding/problems" element={<ProblemListPage />} />
          <Route path="/deepcoding/problems/:id" element={<ProblemDetailPage />} />

          {/* Admin Routes with AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/notices" element={<AdminBoard boardType="notice" />} />
              <Route path="/admin/notices/create" element={<AdminNoticeCreate />} />
              <Route path="/admin/notices/:id" element={<AdminPostDetail />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/courses/create" element={<CreateCourse />} />
              <Route path="/admin/courses/:id" element={<CourseDetail />} />
              <Route path="/admin/courses/:id/edit" element={<EditCourse />} />
              <Route path="/admin/courses/:id/enrollments" element={<CourseEnrollmentsPage />} />
              <Route path="/admin/courses/:courseId/quiz/:quizId/results" element={<QuizResults />} />
              <Route path="/admin/courses/:courseId/assignments" element={<CourseAssignmentsPage />} />
              <Route path="/admin/courses/assignments/submissions/:assignmentId" element={<SubmissionsPage />} />
              <Route path="/admin/courses/assignments/submission/:submissionId" element={<SubmissionDetailPage />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/students/:studentId" element={<AdminStudentDetail />} />
              <Route path="/admin/monitoring" element={<AdminMonitoring />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/reviews/create" element={<AdminCreateReviewPage />} />
              <Route path="/admin/reviews/:id/edit" element={<AdminEditReviewPage />} />
              <Route path="/admin/reviews/:reviewId/results" element={<AdminReviewResultsPage />} />
              <Route path="/admin/boards" element={<AdminBoards />} />
              <Route path="/admin/qna" element={<AdminBoard boardType="qna" />} />
              <Route path="/admin/qna/:id" element={<AdminPostDetail />} />
              <Route path="/admin/community" element={<AdminBoard boardType="community" />} />
              <Route path="/admin/community/:id" element={<AdminPostDetail />} />
            </Route>
          </Route>

          {/* Student/Instructor Routes with RootLayout */}
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<StudentLanding />} />
            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            
            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="mycourse" element={<StudentCoursesPage />} />
              <Route path="mycourse/:courseId" element={<StudentCoursesPage />} />
              <Route path="mycourse/:courseId/week/:weekId/quiz" element={<QuizPage />} />
              <Route path="mycourse/:courseId/quiz/:quizFileName" element={<QuizPage />} />
              <Route path="mycourse/:courseId/week/:weekId/video/:videoId" element={<VideoPlayerPage />} />
              <Route path="student/wishlist" element={<WishlistPage />} />
              <Route path="student/cart" element={<CartPage />} />
              <Route path="notices" element={<NoticeList />} />
              <Route path="notices/:id" element={<NoticeDetail />} />
              <Route path="community" element={<CommunityList />} />
              <Route path="community/create" element={<CommunityCreate />} />
              <Route path="community/:id" element={<CommunityDetail />} />
              <Route path="qna" element={<QnaList />} />
              <Route path="qna/create" element={<QnaCreate />} />
              <Route path="qna/:id" element={<QnaDetail />} />
              <Route path="assignments" element={<AssignmentListPage />} />
              <Route path="assignments/:id" element={<AssignmentDetailPage />} />
              <Route path="pending-courses" element={<PendingCoursesPage />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;