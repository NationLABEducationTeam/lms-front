import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { UserRole } from '../../config/cognito';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userRole = localStorage.getItem('userRole') as UserRole;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    alert('로그인이 필요한 서비스입니다.');
    return <Navigate to="/auth" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    alert('접근 권한이 없습니다.');
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 