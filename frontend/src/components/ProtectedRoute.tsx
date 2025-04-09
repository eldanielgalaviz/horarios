// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
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
  if (!allowedRoles.includes(authState.user.role)) {
    // Redirigir a la página por defecto según su rol
    switch (authState.user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'profesor':
        return <Navigate to="/profesor/horarios" replace />;
      case 'estudiante':
        return <Navigate to="/estudiante/horarios" replace />;
      case 'checador':
        return <Navigate to="/checador/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  // Si se requiere ser jefe de grupo pero el usuario no lo es
  if (authState.user.role === 'estudiante' && requireJefeGrupo && !authState.user.esJefeGrupo) {
    return <Navigate to="/estudiante/horarios" replace />;
  }
  
  // Si pasa todas las validaciones, permitir acceso a las rutas secundarias
  return <Outlet />;
};

export default ProtectedRoute;