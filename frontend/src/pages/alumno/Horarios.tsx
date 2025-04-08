import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import { format, parse } from 'date-fns';

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
  Grupo: {
    ID_Grupo: number;
    Nombre: string;
  };
}

interface CreateAsistenciaDto {
  Horario_ID: number;
  Asistio: boolean;
  Fecha: string;
}

const AlumnoHorarios: React.FC = () => {
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch student schedules
  const { data: horarios, isLoading, error } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos/me/horarios');
      return response.data as Horario[];
    }
  });
  
  // Register attendance mutation
  const registerAttendanceMutation = useMutation({
    mutationFn: async (data: CreateAsistenciaDto) => {
      const response = await axiosInstance.post('/alumnos/me/asistencia', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
      setOpenDialog(false);
    },
  });
  
  const handleRegisterAttendance = (horario: Horario) => {
    setSelectedHorario(horario);
    setOpenDialog(true);
  };
  
  const confirmAttendance = () => {
    if (!selectedHorario) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    registerAttendanceMutation.mutate({
      Horario_ID: selectedHorario.ID,
      Asistio: true,
      Fecha: today
    });
  };
  
  // Group schedules by day of week
  const groupByDay = () => {
    if (!horarios) return {};
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return horarios.reduce((acc, horario) => {
      const dayOfWeek = new Date(horario.Dias).getDay();
      const day = days[dayOfWeek];
      
      if (!acc[day]) {
        acc[day] = [];
      }
      
      acc[day].push(horario);
      return acc;
    }, {} as Record<string, Horario[]>);
  };
  
  const scheduleByDay = groupByDay();
  
  // Format time for display (19:30:00 -> 7:30 PM)
  const formatTime = (timeStr: string) => {
    try {
      const date = parse(timeStr, 'HH:mm:ss', new Date());
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        My Schedule
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error loading schedule</Alert>
      ) : (
        <>
          {Object.entries(scheduleByDay).map(([day, dayHorarios]) => (
            <Box key={day} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                {day}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dayHorarios.map((horario) => (
                      <TableRow key={horario.ID}>
                        <TableCell>{horario.Materia.Nombre}</TableCell>
                        <TableCell>{formatTime(horario.HoraInicio)} - {formatTime(horario.HoraFin)}</TableCell>
                        <TableCell>{horario.Materia.Maestro.Nombre}</TableCell>
                        <TableCell>{horario.Salon.Nombre}</TableCell>
                        <TableCell>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleRegisterAttendance(horario)}
                            // Only enable for today's classes
                            disabled={new Date(horario.Dias).getDay() !== new Date().getDay()}
                          >
                            Register Attendance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
          
          {/* Check if there are no classes scheduled */}
          {Object.keys(scheduleByDay).length === 0 && (
            <Alert severity="info">No classes have been scheduled for you yet.</Alert>
          )}
          
          {/* Attendance Confirmation Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          >
            <DialogTitle>Confirm Attendance</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to register your attendance for {selectedHorario?.Materia.Nombre}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                onClick={confirmAttendance} 
                variant="contained"
                disabled={registerAttendanceMutation.isPending}
              >
                {registerAttendanceMutation.isPending ? 'Registering...' : 'Confirm'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </MainLayout>
  );
};

export default AlumnoHorarios;
