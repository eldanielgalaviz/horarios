import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
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
  };
  Salon: {
    ID_Salon: number;
    Nombre: string;
  };
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`day-tabpanel-${index}`}
      aria-labelledby={`day-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const MaestroHorarios: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  
  // Fetch teacher schedules
  const { data: horarios, isLoading, error } = useQuery({
    queryKey: ['maestro', 'horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/horarios');
      return response.data as Horario[];
    }
  });

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

  // Format date to day of week
  const formatDayOfWeek = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'EEEE', { locale: es });
    } catch {
      return 'Día desconocido';
    }
  };

  // Group schedules by day of week
  const schedulesByDay = React.useMemo(() => {
    if (!horarios) return Array(7).fill([]);
    
    // Initialize array for all days of the week
    const days = Array(7).fill(null).map(() => []);
    
    horarios.forEach(horario => {
      const dayOfWeek = new Date(horario.Dias).getDay();
      days[dayOfWeek].push(horario);
    });
    
    // Sort each day's schedules by time
    days.forEach(daySchedules => {
      daySchedules.sort((a, b) => a.HoraInicio.localeCompare(b.HoraInicio));
    });
    
    return days;
  }, [horarios]);
  
  // Days of week for tabs
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleDayChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedDay(newValue);
  };

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Mi Horario de Clases
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar los horarios. Por favor, intenta nuevamente.</Alert>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedDay}
              onChange={handleDayChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="days of week tabs"
            >
              {daysOfWeek.map((day, index) => (
                <Tab 
                  key={day} 
                  label={day} 
                  id={`day-tab-${index}`}
                  aria-controls={`day-tabpanel-${index}`}
                  sx={{ 
                    fontWeight: selectedDay === index ? 'bold' : 'normal',
                    color: selectedDay === index ? 'primary.main' : 'text.primary'
                  }}
                />
              ))}
            </Tabs>
            
            {daysOfWeek.map((day, index) => (
              <TabPanel key={day} value={selectedDay} index={index}>
                <Box sx={{ p: 2 }}>
                  {schedulesByDay[index].length === 0 ? (
                    <Alert severity="info">No tienes clases programadas para este día.</Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {schedulesByDay[index].map((horario) => (
                        <Box key={horario.ID} sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <BookIcon sx={{ mr: 1 }} />
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
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <GroupIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    Grupo: <strong>{horario.Grupo.Nombre}</strong>
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <MeetingRoomIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    Salón: <strong>{horario.Salon.Nombre}</strong>
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarTodayIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    Día: <strong>{formatDayOfWeek(horario.Dias)}</strong>
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </TabPanel>
            ))}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen Semanal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon color="primary" />
                  <Typography variant="body1">
                    <strong>Total de Clases:</strong> {horarios?.length || 0}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  <Typography variant="body1">
                    <strong>Grupos Asignados:</strong> {new Set(horarios?.map(h => h.Grupo.ID_Grupo)).size}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookIcon color="primary" />
                  <Typography variant="body1">
                    <strong>Materias Impartidas:</strong> {new Set(horarios?.map(h => h.Materia.ID_Materia)).size}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </MainLayout>
  );
};

export default MaestroHorarios;