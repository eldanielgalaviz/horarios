import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  requireJefeGrupo?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles,
  requireJefeGrupo = false
}) => {
  const { authState } = useAuth();
  
  // Si no está autenticado, redirigir al login
  if (!authState.isAuthenticated || !authState.user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si el rol del usuario no está permitido para esta ruta
  if (!allowedRoles.includes(authState.user.userType)) {
    // Redirigir a la página por defecto según su rol
    switch (authState.user.userType) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.MAESTRO:
        return <Navigate to="/maestro/horarios" replace />;
      case UserRole.ALUMNO:
        return <Navigate to="/alumno/horarios" replace />;
      case UserRole.CHECADOR:
        return <Navigate to="/checador/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  // Si se requiere ser jefe de grupo pero el usuario no lo es
  if (authState.user.userType === UserRole.ALUMNO && requireJefeGrupo && !authState.user.esJefeGrupo) {
    return <Navigate to="/alumno/horarios" replace />;
  }
  
  // Si pasa todas las validaciones, permitir acceso a las rutas secundarias
  return <Outlet />;
};

export default ProtectedRoute;