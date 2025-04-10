import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { authState } = useAuth();
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated || !authState.user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user role is not allowed to access this route
  if (!allowedRoles.includes(authState.user.userType)) {
    // Redirect to the default page according to their role
    switch (authState.user.userType) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.ALUMNO:
        return <Navigate to="/alumno/dashboard" replace />;
      case UserRole.MAESTRO:
        return <Navigate to="/maestro/dashboard" replace />;
      case UserRole.CHECADOR:
        return <Navigate to="/checador/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  // If all validations pass, allow access to child routes
  return <Outlet />;
};

export default ProtectedRoute;