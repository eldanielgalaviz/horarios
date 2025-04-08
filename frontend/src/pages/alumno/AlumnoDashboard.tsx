import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Horario {
  ID: number;
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
  Materia: {
    ID_Materia: number;
    Nombre: string;
    Maestro: {
      ID_Maestro: number;
      Nombre: string;
    };
  };
  Salon: {
    ID_Salon: number;
    Nombre: string;
  };
}

interface Asistencia {
  ID: number;
  Horario: Horario;
  Asistio: boolean;
  Fecha: string;
}

const AlumnoDashboard: React.FC = () => {
  const { authState } = useAuth();
  
  // Fetch student schedules
  const { data: horarios, isLoading: horariosLoading, error: horariosError } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos/me/horarios');
      return response.data as Horario[];
    }
  });
  
  // Fetch student attendance
  const { data: asistencias, isLoading: asistenciasLoading, error: asistenciasError } = useQuery({
    queryKey: ['asistencias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos/me/asistencias');
      return response.data as Asistencia[];
    }
  });
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's schedule
  const todaySchedule = horarios?.filter(horario => {
    // Simplified check - in a real app you'd implement proper day matching
    return new Date(horario.Dias).getDay() === new Date().getDay();
  }) || [];
  
  // Calculate attendance stats
  const totalAsistencias = asistencias?.length || 0;
  const presentCount = asistencias?.filter(a => a.Asistio).length || 0;
  const attendanceRate = totalAsistencias > 0 ? (presentCount / totalAsistencias) * 100 : 0;

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Welcome, {authState.user?.nombre}
      </Typography>
      
      {/* Summary Cards - using Box instead of Grid */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3,
        mb: 3
      }}>
        {/* Card 1 - Attendance Rate */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={attendanceRate}
                    size={80}
                    thickness={4}
                    color={attendanceRate >= 80 ? 'success' : attendanceRate >= 60 ? 'warning' : 'error'}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {`${Math.round(attendanceRate)}%`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  Present: {presentCount} / {totalAsistencias} classes
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/alumno/asistencias">
                View Details
              </Button>
            </CardActions>
          </Card>
        </Box>
        
        {/* Card 2 - Today's Classes */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Classes
              </Typography>
              <Typography variant="h4">
                {todaySchedule.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {today}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/alumno/horarios">
                View Schedule
              </Button>
            </CardActions>
          </Card>
        </Box>
        
        {/* Card 3 - Next Class */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Next Class
              </Typography>
              {todaySchedule.length > 0 ? (
                <>
                  <Typography variant="body1">
                    {todaySchedule[0].Materia.Nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {todaySchedule[0].HoraInicio} - {todaySchedule[0].HoraFin}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Room: {todaySchedule[0].Salon.Nombre}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No classes scheduled for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Today's Schedule */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Today's Schedule
        </Typography>
        
        {horariosLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : horariosError ? (
          <Alert severity="error">Error loading schedules</Alert>
        ) : todaySchedule.length === 0 ? (
          <Typography variant="body1" sx={{ p: 2 }}>
            No classes scheduled for today.
          </Typography>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2
          }}>
            {todaySchedule.map((horario) => (
              <Box key={horario.ID} sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {horario.Materia.Nombre}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {horario.HoraInicio} - {horario.HoraFin}
                    </Typography>
                    <Typography variant="body2">
                      Teacher: {horario.Materia.Maestro.Nombre}
                    </Typography>
                    <Typography variant="body2">
                      Room: {horario.Salon.Nombre}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </MainLayout>
  );
};

export default AlumnoDashboard;