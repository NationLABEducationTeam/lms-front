import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminCourses from './pages/admin/courses';
import AdminCourseCreate from './pages/admin/courses/create';
import NoticeList from './pages/student/board/NoticeList';
import NoticeDetail from './pages/student/board/NoticeDetail';
import CommunityList from './pages/student/board/CommunityList';
import CommunityCreate from './pages/student/board/CommunityCreate';
import CommunityDetail from './pages/student/board/CommunityDetail';
import QnaList from './pages/student/board/QnaList';
import QnaCreate from './pages/student/board/QnaCreate';
import QnaDetail from './pages/student/board/QnaDetail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/common/layout/admin/AdminLayout';
import { UserRole } from './config/cognito';
import './App.css';
import CourseDetailPage from './pages/student/[courseId]';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<StudentLanding />} />
          
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/notices" element={<NoticeList />} />
            <Route path="/notices/:id" element={<NoticeDetail />} />
            <Route path="/community" element={<CommunityList />} />
            <Route path="/community/create" element={<CommunityCreate />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            <Route path="/qna" element={<QnaList />} />
            <Route path="/qna/create" element={<QnaCreate />} />
            <Route path="/qna/:id" element={<QnaDetail />} />
          </Route>
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <RootLayout>
              <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR]}>
                <InstructorPage />
              </ProtectedRoute>
            </RootLayout>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/notices" element={<AdminNotices />} />
                  <Route path="/notices/create" element={<AdminNoticeCreate />} />
                  <Route path="/notices/:id" element={<AdminNoticeDetail />} />
                  <Route path="/courses" element={<AdminCourses />} />
                  <Route path="/courses/create" element={<AdminCourseCreate />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;