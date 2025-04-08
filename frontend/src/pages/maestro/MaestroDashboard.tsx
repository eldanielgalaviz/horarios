// src/pages/maestro/MaestroDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Button,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Maestro {
  ID_Maestro: number;
  Nombre: string;
  Correo: string;
  materias: Materia[];
}

interface Materia {
  ID_Materia: number;
  Nombre: string;
  Salon: {
    ID_Salon: number;
    Nombre: string;
  };
}

interface Horario {
  ID: number;
  Grupo: {
    ID_Grupo: number;
    Nombre: string;
  };
  Materia: {
    ID_Materia: number;
    Nombre: string;
  };
  Salon: {
    ID_Salon: number;
    Nombre: string;
  };
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

interface Asistencia {
  ID: number;
  Horario: Horario;
  Asistio: boolean;
  Fecha: string;
}

const MaestroDashboard: React.FC = () => {
  const { authState } = useAuth();
  
  // Fetch teacher data
  const { data: maestro, isLoading: maestroLoading } = useQuery({
    queryKey: ['maestro', 'profile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/profile');
      return response.data as Maestro;
    }
  });
  
  // Fetch teacher schedules
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['maestro', 'horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/horarios');
      return response.data as Horario[];
    }
  });
  
  // Fetch teacher attendance records
  const { data: asistencias, isLoading: asistenciasLoading } = useQuery({
    queryKey: ['maestro', 'asistencias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/asistencias');
      return response.data as Asistencia[];
    }
  });
  
  // Get today's date and format it
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  
  // Filter today's schedule
  const todayHorarios = horarios?.filter(horario => {
    const horarioDia = new Date(horario.Dias).getDay();
    return horarioDia === today.getDay();
  }) || [];
  
  // Sort today's schedule by time
  todayHorarios.sort((a, b) => {
    return a.HoraInicio.localeCompare(b.HoraInicio);
  });
  
  // Get this week's attendance
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const thisWeekAsistencias = asistencias?.filter(asistencia => {
    const asistenciaDate = new Date(asistencia.Fecha);
    return asistenciaDate >= startOfWeek && asistenciaDate <= endOfWeek;
  }) || [];
  
  // Calculate attendance statistics
  const totalAsistencias = asistencias?.length || 0;
  const presentCount = asistencias?.filter(a => a.Asistio).length || 0;
  const attendanceRate = totalAsistencias > 0 ? (presentCount / totalAsistencias) * 100 : 0;
  
  // Calculate statistics by group
  const groupStats = React.useMemo(() => {
    if (!asistencias) return [];
    
    const groupMap = new Map();
    
    asistencias.forEach(asistencia => {
      const grupoId = asistencia.Horario.Grupo.ID_Grupo;
      const grupoNombre = asistencia.Horario.Grupo.Nombre;
      
      if (!groupMap.has(grupoId)) {
        groupMap.set(grupoId, {
          id: grupoId,
          nombre: grupoNombre,
          total: 0,
          present: 0
        });
      }
      
      const group = groupMap.get(grupoId);
      group.total++;
      if (asistencia.Asistio) group.present++;
    });
    
    return Array.from(groupMap.values())
      .map(group => ({
        ...group,
        rate: (group.present / group.total) * 100
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [asistencias]);
  
  // Format time for display (19:30:00 -> 7:30 PM)
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP', { locale: es });
    } catch {
      return dateStr;
    }
  };
  
  const isLoading = maestroLoading || horariosLoading || asistenciasLoading;
  
  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido, {authState.user?.nombre}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {/* Stats Cards */}
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mis Materias
            </Typography>
            <Typography variant="h3" color="primary">
              {maestro?.materias?.length || 0}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={Link} to="/maestro/materias">
              Ver Detalles
            </Button>
          </CardActions>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clases Hoy
            </Typography>
            <Typography variant="h3" color="secondary">
              {todayHorarios.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(today, 'EEEE, d MMMM yyyy', { locale: es })}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={Link} to="/maestro/horarios">
              Ver Horario
            </Button>
          </CardActions>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tasa de Asistencia
            </Typography>
            <Typography variant="h3" color={attendanceRate >= 80 ? 'success.main' : 'warning.main'}>
              {attendanceRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {presentCount} presentes de {totalAsistencias} clases
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={Link} to="/maestro/asistencias">
              Ver Asistencias
            </Button>
          </CardActions>
        </Card>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        {/* Today's Schedule */}
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Horario de Hoy
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : todayHorarios.length === 0 ? (
            <Alert severity="info">No tienes clases programadas para hoy.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todayHorarios.map((horario) => (
                <Card key={horario.ID} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        {horario.Materia.Nombre}
                      </Typography>
                      <Chip 
                        icon={<AccessTimeIcon />} 
                        label={`${formatTime(horario.HoraInicio)} - ${formatTime(horario.HoraFin)}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        <GroupIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Grupo: {horario.Grupo.Nombre}
                      </Typography>
                      <Typography variant="body2">
                        Salón: {horario.Salon.Nombre}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained" 
                      component={Link} 
                      to={`/maestro/asistencias/registrar/${horario.ID}`}
                    >
                      Registrar Asistencia
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        
        {/* Group Stats */}
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Estadísticas por Grupo
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : groupStats.length === 0 ? (
            <Alert severity="info">No hay datos de asistencia disponibles.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Grupo</TableCell>
                    <TableCell align="center">Total Clases</TableCell>
                    <TableCell align="center">Asistencia</TableCell>
                    <TableCell align="right">Tasa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupStats.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>{group.nombre}</TableCell>
                      <TableCell align="center">{group.total}</TableCell>
                      <TableCell align="center">{group.present}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${group.rate.toFixed(1)}%`}
                          color={
                            group.rate >= 80 ? 'success' : 
                            group.rate >= 60 ? 'warning' : 
                            'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Recent Attendance */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          <CheckCircleOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Asistencias Recientes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : thisWeekAsistencias.length === 0 ? (
          <Alert severity="info">No hay registros de asistencia esta semana.</Alert>
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Grupo</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Salón</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {thisWeekAsistencias.slice(0, 5).map((asistencia) => (
                    <TableRow key={asistencia.ID}>
                      <TableCell>{formatDate(asistencia.Fecha)}</TableCell>
                      <TableCell>{asistencia.Horario.Grupo.Nombre}</TableCell>
                      <TableCell>{asistencia.Horario.Materia.Nombre}</TableCell>
                      <TableCell>
                        {formatTime(asistencia.Horario.HoraInicio)} - {formatTime(asistencia.Horario.HoraFin)}
                      </TableCell>
                      <TableCell>{asistencia.Horario.Salon.Nombre}</TableCell>
                      <TableCell align="center">
                        {asistencia.Asistio ? (
                          <Chip 
                            icon={<CheckCircleOutlineIcon />} 
                            label="Presente" 
                            color="success" 
                            size="small"
                          />
                        ) : (
                          <Chip 
                            icon={<CancelIcon />} 
                            label="Ausente" 
                            color="error" 
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {thisWeekAsistencias.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button component={Link} to="/maestro/asistencias">
                  Ver Todos los Registros
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </MainLayout>
  );
};

export default MaestroDashboard;