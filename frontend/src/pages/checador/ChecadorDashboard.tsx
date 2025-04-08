import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Horario {
  ID: number;
  Grupo: {
    ID_Grupo: number;
    Nombre: string;
  };
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
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

interface Asistencia {
  ID: number;
  Horario: Horario;
  Asistio: boolean;
  Fecha: string;
  FechaRegistro: string;
}

const ChecadorDashboard: React.FC = () => {
  // Obtener todos los horarios
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['checador', 'horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/checadores/horarios/all');
      return response.data as Horario[];
    }
  });
  
  // Obtener asistencias recientes
  const { data: asistencias, isLoading: asistenciasLoading } = useQuery({
    queryKey: ['checador', 'asistencias', 'recientes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/checadores/asistencias/all');
      return response.data as Asistencia[];
    }
  });
  
  // Obtener horarios de hoy
  const horariosHoy = React.useMemo(() => {
    if (!horarios) return [];
    const hoy = new Date().getDay();
    
    return horarios.filter(horario => {
      const diaHorario = new Date(horario.Dias).getDay();
      return diaHorario === hoy;
    }).sort((a, b) => a.HoraInicio.localeCompare(b.HoraInicio));
  }, [horarios]);
  
  // Obtener asistencias registradas hoy
  const asistenciasHoy = React.useMemo(() => {
    if (!asistencias) return [];
    const hoy = new Date().toISOString().split('T')[0];
    
    return asistencias.filter(asistencia => {
      const fechaAsistencia = asistencia.Fecha.split('T')[0];
      return fechaAsistencia === hoy;
    });
  }, [asistencias]);
  
  // Format time for display (19:30:00 -> 7:30 PM)
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
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
  
  // Calcular estadísticas
  const estadisticas = React.useMemo(() => {
    if (!asistencias) return { total: 0, presentes: 0, tasa: 0, grupos: 0 };
    
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.Asistio).length;
    const gruposUnicos = new Set(asistencias.map(a => a.Horario.Grupo.ID_Grupo)).size;
    
    return {
      total,
      presentes,
      tasa: total > 0 ? (presentes / total) * 100 : 0,
      grupos: gruposUnicos
    };
  }, [asistencias]);
  
  const isLoading = horariosLoading || asistenciasLoading;
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Panel de Asistencias
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registros de Asistencia
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {estadisticas.total}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/checador/reports">
                    Ver Reportes
                  </Button>
                </CardActions>
              </Card>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tasa de Asistencia
                  </Typography>
                  <Typography variant="h3" color={
                    estadisticas.tasa >= 80 ? 'success.main' :
                    estadisticas.tasa >= 60 ? 'warning.main' :
                    'error.main'
                  }>
                    {estadisticas.tasa.toFixed(1)}%
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/checador/reports">
                    Ver Detalles
                  </Button>
                </CardActions>
              </Card>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Grupos Activos
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {estadisticas.grupos}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/checador/register">
                    Registrar Asistencia
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
          
          {/* Horarios de hoy */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horarios de Hoy
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/checador/register"
              >
                Registrar Asistencia
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {horariosHoy.length === 0 ? (
              <Alert severity="info">No hay horarios programados para hoy.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell>Profesor</TableCell>
                      <TableCell>Horario</TableCell>
                      <TableCell>Salón</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {horariosHoy.map((horario) => (
                      <TableRow key={horario.ID}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {horario.Grupo.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ClassIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {horario.Materia.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>{horario.Materia.Maestro.Nombre}</TableCell>
                        <TableCell>{formatTime(horario.HoraInicio)} - {formatTime(horario.HoraFin)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MeetingRoomIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {horario.Salon.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            component={Link}
                            to={`/checador/register?horarioId=${horario.ID}`}
                          >
                            Registrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
          
          {/* Asistencias recientes */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              <CheckCircleOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Asistencias Recientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {asistenciasHoy.length === 0 ? (
              <Alert severity="info">No se han registrado asistencias hoy.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell>Horario</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asistenciasHoy.slice(0, 10).map((asistencia) => (
                      <TableRow key={asistencia.ID}>
                        <TableCell>{formatDate(asistencia.Fecha)}</TableCell>
                        <TableCell>{asistencia.Horario.Grupo.Nombre}</TableCell>
                        <TableCell>{asistencia.Horario.Materia.Nombre}</TableCell>
                        <TableCell>{formatTime(asistencia.Horario.HoraInicio)} - {formatTime(asistencia.Horario.HoraFin)}</TableCell>
                        <TableCell align="center">
                          {asistencia.Asistio ? (
                            <Chip
                              icon={<CheckCircleOutlineIcon />}
                              label="Presente"
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Chip
                              icon={<CancelIcon />}
                              label="Ausente"
                              size="small"
                              color="error"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {asistenciasHoy.length > 10 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button component={Link} to="/checador/reports">
                  Ver Todos los Registros
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}
    </MainLayout>
  );
};

export default ChecadorDashboard;