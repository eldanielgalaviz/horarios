import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { UserRole } from './types/auth.types.ts';

// Pages
import LoginPage from './pages/login.tsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import UserManagement from './pages/admin/UserManagement.tsx';
import GrupoManagement from './pages/admin/Grupo.Management.tsx';
import MateriaManagement from './pages/admin/Materia.Management.tsx';
import SalonManagement from './pages/admin/SalonManagement.tsx';
import AlumnoManagement from './pages/admin/AlumnoManagement.tsx';
import MaestrosManagement from './pages/admin/MaestrosManagement.tsx';
import ChecadorManagement from './pages/admin/ChecadorManagement.tsx';
import AsistenciaReports from './pages/admin/AsistenciaReports.tsx';

// Student Pages
import AlumnoDashboard from './pages/alumno/AlumnoDashboard.tsx';
import AlumnoHorarios from './pages/alumno/Horarios.tsx';
import AlumnoAsistencias from './pages/alumno/Asistencias.tsx';

// Teacher Pages
import MaestroDashboard from './pages/maestro/MaestroDashboard.tsx';
import MisMaterias from './pages/maestro/MisMaterias.tsx';
import RegistroAsistencia from './pages/maestro/RegistroAsistencia.tsx';

// Placeholder components with proper TypeScript typing
const ReportesGrupo: React.FC = () => <div>Reportes Grupo (Placeholder)</div>;
const ChecadorDashboard: React.FC = () => <div>Checador Dashboard (Placeholder)</div>;

const queryClient: QueryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            {/* This is the correct way to use Navigate */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/grupos" element={<GrupoManagement />} />
              <Route path="/admin/materias" element={<MateriaManagement />} />
              <Route path="/admin/salones" element={<SalonManagement />} />
              <Route path="/admin/alumnos" element={<AlumnoManagement />} />
              <Route path="/admin/maestros" element={<MaestrosManagement />} />
              <Route path="/admin/checadores" element={<ChecadorManagement />} />
              <Route path="/admin/asistencias" element={<AsistenciaReports />} />
            </Route>
            
            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ALUMNO]} />}>
              <Route path="/alumno/dashboard" element={<AlumnoDashboard />} />
              <Route path="/alumno/horarios" element={<AlumnoHorarios />} />
              <Route path="/alumno/asistencias" element={<AlumnoAsistencias />} />
            </Route>
            
            {/* Teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.MAESTRO]} />}>
              <Route path="/maestro/dashboard" element={<MaestroDashboard />} />
              <Route path="/maestro/materias" element={<MisMaterias />} />
              <Route path="/maestro/asistencias/registrar/:horarioId" element={<RegistroAsistencia />} />
              <Route path="/maestro/reportes" element={<ReportesGrupo />} />
            </Route>
            
            {/* Checker routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.CHECADOR]} />}>
              <Route path="/checador/dashboard" element={<ChecadorDashboard />} />
            </Route>
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;