import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';
import VerifyEmail from './components/auth/VerifyEmail';
import StudentPage from './pages/student/dashboard/index';
import InstructorPage from './pages/instructor/index';
import AdminPage from './pages/admin/dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './config/cognito';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR]}>
              <InstructorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;