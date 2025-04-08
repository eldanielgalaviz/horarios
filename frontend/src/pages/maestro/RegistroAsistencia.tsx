// src/pages/maestro/RegistroAsistencia.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Snackbar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Switch
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import BookIcon from '@mui/icons-material/Book';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Horario {
  ID: number;
  Grupo: {
    ID_Grupo: number;
    Nombre: string;
    alumnos: Alumno[];
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

interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
}

interface AsistenciaRegistro {
  alumnoId: number;
  presente: boolean;
}

interface AsistenciaSubmitDto {
  Horario_ID: number;
  Fecha: string;
  Registros: AsistenciaRegistro[];
}

const RegistroAsistencia: React.FC = () => {
  const { horarioId } = useParams<{ horarioId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [asistencias, setAsistencias] = useState<Record<number, boolean>>({});
  const [todosPresentes, setTodosPresentes] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [fechaRegistro, setFechaRegistro] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Fetch schedule details
  const { data: horario, isLoading, error } = useQuery({
    queryKey: ['horario', horarioId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/horarios/${horarioId}`);
      return response.data as Horario;
    }
  });
  
  // Initialize asistencias state when horario data is loaded
  useEffect(() => {
    if (horario && horario.Grupo && horario.Grupo.alumnos) {
      const initialAsistencias = horario.Grupo.alumnos.reduce((acc, alumno) => {
        acc[alumno.ID_Alumno] = false; // Por defecto, todos ausentes
        return acc;
      }, {} as Record<number, boolean>);
      
      setAsistencias(initialAsistencias);
    }
  }, [horario]);
  
  // Handle toggle all attendance
  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setTodosPresentes(checked);
    
    if (horario && horario.Grupo.alumnos) {
      const updatedAsistencias = Object.keys(asistencias).reduce((acc, key) => {
        acc[parseInt(key)] = checked;
        return acc;
      }, {} as Record<number, boolean>);
      
      setAsistencias(updatedAsistencias);
    }
  };
  
  // Handle individual attendance toggle
  const handleToggleAsistencia = (alumnoId: number) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
    
    // Check if all students are now present
    const updatedAsistencias = {
      ...asistencias,
      [alumnoId]: !asistencias[alumnoId]
    };
    
    const allPresent = horario?.Grupo.alumnos.every(alumno => updatedAsistencias[alumno.ID_Alumno]);
    setTodosPresentes(allPresent || false);
  };
  
  // Submit attendance records mutation
  const submitAsistenciasMutation = useMutation({
    mutationFn: async (data: AsistenciaSubmitDto) => {
      // In a real app, this would be an API endpoint for bulk attendance recording
      // For now, we'll simulate multiple individual submissions
      for (const registro of data.Registros) {
        await axiosInstance.post('/asistencias', {
          Horario_ID: data.Horario_ID,
          Alumno_ID: registro.alumnoId,
          Asistio: registro.presente,
          Fecha: data.Fecha
        });
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      setSnackbar({
        open: true,
        message: 'Asistencias registradas exitosamente',
        severity: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/maestro/horarios');
      }, 2000);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al registrar las asistencias',
        severity: 'error'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = () => {
    if (!horario) return;
    
    const registros = Object.entries(asistencias).map(([alumnoId, presente]) => ({
      alumnoId: parseInt(alumnoId),
      presente
    }));
    
    submitAsistenciasMutation.mutate({
      Horario_ID: horario.ID,
      Fecha: fechaRegistro,
      Registros: registros
    });
  };
  
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
      return format(new Date(dateStr), 'PPPP', { locale: es });
    } catch {
      return dateStr;
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Count present students
  const presentCount = Object.values(asistencias).filter(Boolean).length;
  const totalStudents = horario?.Grupo.alumnos.length || 0;
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/maestro/horarios')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          Registro de Asistencia
        </Typography>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          Error al cargar los datos del horario. Por favor, intenta nuevamente.
        </Alert>
      ) : horario ? (
        <Box>
          {/* Schedule Info Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {horario.Materia.Nombre}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Grupo: <strong>{horario.Grupo.Nombre}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MeetingRoomIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Salón: <strong>{horario.Salon.Nombre}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Horario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Fecha: <strong>{formatDate(fechaRegistro)}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      Hora: <strong>{formatTime(horario.HoraInicio)} - {formatTime(horario.HoraFin)}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de Asistencia
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">
                    Presentes: <strong>{presentCount}</strong> de <strong>{totalStudents}</strong> estudiantes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`${totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}% de asistencia`}
                    color={
                      totalStudents === 0 ? 'default' :
                      presentCount === totalStudents ? 'success' :
                      presentCount >= totalStudents * 0.7 ? 'primary' :
                      presentCount >= totalStudents * 0.5 ? 'warning' :
                      'error'
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Attendance Recording Form */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Lista de Estudiantes
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={todosPresentes}
                    onChange={handleToggleAll}
                    color="primary"
                  />
                }
                label="Todos Presentes"
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {horario.Grupo.alumnos.length === 0 ? (
              <Alert severity="info">No hay estudiantes asignados a este grupo.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Correo</TableCell>
                      <TableCell align="center">Asistencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {horario.Grupo.alumnos.map((alumno) => (
                      <TableRow key={alumno.ID_Alumno}>
                        <TableCell>{alumno.ID_Alumno}</TableCell>
                        <TableCell>{alumno.Nombre}</TableCell>
                        <TableCell>{alumno.Correo}</TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={asistencias[alumno.ID_Alumno] || false}
                            onChange={() => handleToggleAsistencia(alumno.ID_Alumno)}
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={horario.Grupo.alumnos.length === 0 || submitAsistenciasMutation.isPending}
              >
                {submitAsistenciasMutation.isPending ? 'Guardando...' : 'Guardar Asistencias'}
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Alert severity="warning">
          No se encontró información del horario. Verifica que el horario exista.
        </Alert>
      )}
      
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default RegistroAsistencia;