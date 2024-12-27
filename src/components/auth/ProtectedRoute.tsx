import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../config/cognito';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole') as UserRole;

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // 권한이 없는 경우 해당 사용자의 기본 페이지로 리다이렉트
    switch (userRole) {
      case UserRole.STUDENT:
        return <Navigate to="/student" replace />;
      case UserRole.INSTRUCTOR:
        return <Navigate to="/instructor" replace />;
      case UserRole.ADMIN:
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 