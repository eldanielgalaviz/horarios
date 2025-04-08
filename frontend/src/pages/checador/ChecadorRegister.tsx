import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  Snackbar,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';

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

const CheckadorRegister: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const horarioIdParam = queryParams.get('horarioId');
  
  // Estado para el formulario
  const [selectedHorarioId, setSelectedHorarioId] = useState<string>(horarioIdParam || '');
  const [fechaRegistro, setFechaRegistro] = useState<Date>(new Date());
  const [asistencias, setAsistencias] = useState<Record<number, boolean>>({});
  const [todosPresentes, setTodosPresentes] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Obtener todos los horarios
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['checador', 'horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/checadores/horarios/all');
      return response.data as Horario[];
    }
  });
  
  // Obtener información del horario seleccionado
  const { data: horarioSeleccionado, isLoading: horarioSeleccionadoLoading } = useQuery({
    queryKey: ['horario', selectedHorarioId],
    queryFn: async () => {
      if (!selectedHorarioId) return null;
      const response = await axiosInstance.get(`/horarios/${selectedHorarioId}`);
      return response.data as Horario;
    },
    enabled: !!selectedHorarioId
  });
  
  // Inicializar estado de asistencias cuando se carga el horario
  useEffect(() => {
    if (horarioSeleccionado && horarioSeleccionado.Grupo && horarioSeleccionado.Grupo.alumnos) {
      const initialAsistencias = horarioSeleccionado.Grupo.alumnos.reduce((acc, alumno) => {
        acc[alumno.ID_Alumno] = false; // Por defecto, todos ausentes
        return acc;
      }, {} as Record<number, boolean>);
      
      setAsistencias(initialAsistencias);
      setTodosPresentes(false);
    }
  }, [horarioSeleccionado]);
  
  // Mutation para registrar asistencias
  const registrarAsistenciaMutation = useMutation({
    mutationFn: async (data: AsistenciaSubmitDto) => {
      const response = await axiosInstance.post('/checadores/asistencias/register', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checador', 'asistencias'] });
      setSnackbar({
        open: true,
        message: 'Asistencias registradas correctamente',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/checador/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al registrar asistencias',
        severity: 'error'
      });
    }
  });
  
  // Handler para cambio de horario
  const handleHorarioChange = (event: SelectChangeEvent) => {
    setSelectedHorarioId(event.target.value);
  };
  
  // Handler para cambio de fecha
  const handleFechaChange = (date: Date | null) => {
    if (date) {
      setFechaRegistro(date);
    }
  };
  
  // Handler para marcar todos presentes/ausentes
  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setTodosPresentes(checked);
    
    if (horarioSeleccionado && horarioSeleccionado.Grupo.alumnos) {
      const updatedAsistencias = Object.keys(asistencias).reduce((acc, key) => {
        acc[parseInt(key)] = checked;
        return acc;
      }, {} as Record<number, boolean>);
      
      setAsistencias(updatedAsistencias);
    }
  };
  
  // Handler para marcar asistencia individual
  const handleToggleAsistencia = (alumnoId: number) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
    
    // Verificar si todos están presentes
    const updatedAsistencias = {
      ...asistencias,
      [alumnoId]: !asistencias[alumnoId]
    };
    
    const allPresent = horarioSeleccionado?.Grupo.alumnos.every(alumno => updatedAsistencias[alumno.ID_Alumno]);
    setTodosPresentes(allPresent || false);
  };
  
  // Handler para enviar el formulario
  const handleSubmit = () => {
    if (!selectedHorarioId || !horarioSeleccionado) {
      setSnackbar({
        open: true,
        message: 'Debe seleccionar un horario',
        severity: 'error'
      });
      return;
    }
    
    const registros: AsistenciaRegistro[] = horarioSeleccionado.Grupo.alumnos.map(alumno => ({
      alumnoId: alumno.ID_Alumno,
      presente: asistencias[alumno.ID_Alumno] || false
    }));
    
    const data: AsistenciaSubmitDto = {
      Horario_ID: parseInt(selectedHorarioId),
      Fecha: format(fechaRegistro, 'yyyy-MM-dd'),
      Registros: registros
    };
    
    registrarAsistenciaMutation.mutate(data);
  };
  
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
  
  // Calcular estadísticas
  const totalAlumnos = horarioSeleccionado?.Grupo.alumnos.length || 0;
  const presentesCount = Object.values(asistencias).filter(Boolean).length;
  const ausentesCount = totalAlumnos - presentesCount;
  
  // Verificar si el formulario es válido
  const isFormValid = !!selectedHorarioId && totalAlumnos > 0;
  
  const isLoading = horariosLoading || horarioSeleccionadoLoading;
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/checador/dashboard')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          Registro de Asistencia
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Horario y Fecha
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="horario-select-label">Horario</InputLabel>
                <Select
                  labelId="horario-select-label"
                  id="horario-select"
                  value={selectedHorarioId}
                  label="Horario"
                  onChange={handleHorarioChange}
                  disabled={isLoading}
                >
                  <MenuItem value="" disabled>Seleccione un horario</MenuItem>
                  {horarios?.map((horario) => (
                    <MenuItem key={horario.ID} value={horario.ID.toString()}>
                      {horario.Grupo.Nombre} - {horario.Materia.Nombre} - {formatTime(horario.HoraInicio)} a {formatTime(horario.HoraFin)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <DatePicker
                label="Fecha de Registro"
                value={fechaRegistro}
                onChange={handleFechaChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : !selectedHorarioId ? (
        <Alert severity="info">
          Seleccione un horario para registrar asistencias.
        </Alert>
      ) : !horarioSeleccionado ? (
        <Alert severity="error">
          No se encontró información del horario seleccionado.
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">
                Registro de Asistencia - {horarioSeleccionado.Grupo.Nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {horarioSeleccionado.Materia.Nombre} - {formatTime(horarioSeleccionado.HoraInicio)} a {formatTime(horarioSeleccionado.HoraFin)} - Salón: {horarioSeleccionado.Salon.Nombre}
              </Typography>
            </Box>
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
          <Divider sx={{ mb: 2 }} />
          
          {horarioSeleccionado.Grupo.alumnos.length === 0 ? (
            <Alert severity="warning">
              No hay alumnos en este grupo.
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Total: <strong>{totalAlumnos}</strong> alumnos | 
                  Presentes: <strong>{presentesCount}</strong> | 
                  Ausentes: <strong>{ausentesCount}</strong> | 
                  Tasa de asistencia: <strong>{totalAlumnos > 0 ? ((presentesCount / totalAlumnos) * 100).toFixed(1) : 0}%</strong>
                </Typography>
              </Box>
              
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Presente</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Correo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {horarioSeleccionado.Grupo.alumnos
                      .sort((a, b) => a.Nombre.localeCompare(b.Nombre))
                      .map((alumno) => (
                      <TableRow key={alumno.ID_Alumno}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={asistencias[alumno.ID_Alumno] || false}
                            onChange={() => handleToggleAsistencia(alumno.ID_Alumno)}
                          />
                        </TableCell>
                        <TableCell>{alumno.ID_Alumno}</TableCell>
                        <TableCell>{alumno.Nombre}</TableCell>
                        <TableCell>{alumno.Correo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={!isFormValid || registrarAsistenciaMutation.isPending}
                >
                  {registrarAsistenciaMutation.isPending ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Guardando...
                    </>
                  ) : 'Guardar Asistencia'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default CheckadorRegister;