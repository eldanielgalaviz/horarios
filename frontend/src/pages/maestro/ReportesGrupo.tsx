// src/pages/maestro/ReportesGrupo.tsx
/*import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout';
import axiosInstance from '../../api/axios';
import {
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BookIcon from '@mui/icons-material/Book';

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
}

interface Materia {
  ID_Materia: number;
  Nombre: string;
}

interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
}

interface Asistencia {
  ID: number;
  Horario: {
    ID: number;
    Grupo: {
      ID_Grupo: number;
      Nombre: string;
    };
    Materia: {
      ID_Materia: number;
      Nombre: string;
    };
  };
  Alumno: Alumno;
  Asistio: boolean;
  Fecha: string;
}

interface AlumnoAsistenciaStats {
  alumno: Alumno;
  total: number;
  presentes: number;
  tasa: number;
}

const ReportesGrupo: React.FC = () => {
  const [filters, setFilters] = useState({
    grupoId: '',
    materiaId: '',
    fechaInicio: subMonths(new Date(), 1), // Por defecto 1 mes atrás
    fechaFin: new Date() // Hoy
  });
  
  // Fetch groups that the teacher teaches
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['maestro', 'grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/horarios');
      const horarios = response.data;
      
      // Extract unique groups from horarios
      const uniqueGrupos = Array.from(
        new Map(
          horarios.map((h: any) => [h.Grupo.ID_Grupo, h.Grupo])
        ).values()
      );
      
      return uniqueGrupos as Grupo[];
    }
  });
  
  // Fetch subjects that the teacher teaches
  const { data: materias, isLoading: materiasLoading } = useQuery({
    queryKey: ['maestro', 'materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/materias');
      return response.data as Materia[];
    }
  });
  
  // Fetch students in the selected group
  const { data: alumnos, isLoading: alumnosLoading } = useQuery({
    queryKey: ['grupo', 'alumnos', filters.grupoId],
    queryFn: async () => {
      if (!filters.grupoId) return [];
      const response = await axiosInstance.get(`/grupos/${filters.grupoId}`);
      return response.data.alumnos || [];
    },
    enabled: !!filters.grupoId
  });
  
  // Fetch attendance data for the selected group and period
  const { data: asistencias, isLoading: asistenciasLoading } = useQuery({
    queryKey: ['asistencias', filters],
    queryFn: async () => {
      if (!filters.grupoId) return [];
      
      const params = new URLSearchParams();
      params.append('fechaInicio', filters.fechaInicio.toISOString().split('T')[0]);
      params.append('fechaFin', filters.fechaFin.toISOString().split('T')[0]);
      
      let url = `/asistencias/grupo/${filters.grupoId}/fecha?${params.toString()}`;
      
      if (filters.materiaId) {
        // If a specific subject is selected, filter asistencias client-side
        const response = await axiosInstance.get(url);
        return response.data.filter((a: Asistencia) => 
          a.Horario.Materia.ID_Materia.toString() === filters.materiaId
        );
      } else {
        const response = await axiosInstance.get(url);
        return response.data;
      }
    },
    enabled: !!filters.grupoId
  });
  
  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };
  
  // Calculate attendance statistics per student
  const calculateStudentStats = (): AlumnoAsistenciaStats[] => {
    if (!alumnos || !asistencias || alumnos.length === 0 || asistencias.length === 0) {
      return [];
    }
    
    const stats: Record<number, AlumnoAsistenciaStats> = {};
    
    // Initialize stats for all students
    alumnos.forEach(alumno => {
      stats[alumno.ID_Alumno] = {
        alumno,
        total: 0,
        presentes: 0,
        tasa: 0
      };
    });
    
    // Count attendance for each student
    asistencias.forEach((asistencia: Asistencia) => {
      const alumnoId = asistencia.Alumno.ID_Alumno;
      if (stats[alumnoId]) {
        stats[alumnoId].total++;
        if (asistencia.Asistio) {
          stats[alumnoId].presentes++;
        }
      }
    });
    
    // Calculate attendance rate
    Object.values(stats).forEach(stat => {
      stat.tasa = stat.total > 0 ? (stat.presentes / stat.total) * 100 : 0;
    });
    
    return Object.values(stats).sort((a, b) => b.tasa - a.tasa);
  };
  
  // Calculate overall attendance stats
  const calculateOverallStats = () => {
    if (!asistencias || asistencias.length === 0) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tasa: 0
      };
    }
    
    const total = asistencias.length;
    const presentes = asistencias.filter((a: Asistencia) => a.Asistio).length;
    
    return {
      total,
      presentes,
      ausentes: total - presentes,
      tasa: (presentes / total) * 100
    };
  };
  
  // Group attendance by date
  const groupAttendanceByDate = () => {
    if (!asistencias) return {};
    
    return asistencias.reduce((acc: Record<string, Asistencia[]>, asistencia: Asistencia) => {
      const date = asistencia.Fecha.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(asistencia);
      return acc;
    }, {});
  };
  
  const studentStats = calculateStudentStats();
  const overallStats = calculateOverallStats();
  const attendanceByDate = groupAttendanceByDate();
  
  const isLoading = gruposLoading || materiasLoading || alumnosLoading || asistenciasLoading;
  const hasFilters = !!filters.grupoId;
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Reportes de Asistencia por Grupo
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' } }}>
            <FormControl fullWidth sx={{ maxWidth: { md: 200 } }}>
              <InputLabel id="grupo-label">Grupo</InputLabel>
              <Select
                labelId="grupo-label"
                value={filters.grupoId}
                label="Grupo"
                onChange={(e) => handleFilterChange('grupoId', e.target.value)}
              >
                <MenuItem value="" disabled>Seleccione un grupo</MenuItem>
                {grupos?.map((grupo) => (
                  <MenuItem key={grupo.ID_Grupo} value={grupo.ID_Grupo.toString()}>
                    {grupo.Nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ maxWidth: { md: 200 } }}>
              <InputLabel id="materia-label">Materia</InputLabel>
              <Select
                labelId="materia-label"
                value={filters.materiaId}
                label="Materia"
                onChange={(e) => handleFilterChange('materiaId', e.target.value)}
                disabled={!filters.grupoId}
              >
                <MenuItem value="">Todas las materias</MenuItem>
                {materias?.map((materia) => (
                  <MenuItem key={materia.ID_Materia} value={materia.ID_Materia.toString()}>
                    {materia.Nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ width: '100%', maxWidth: { md: 200 } }}>
              <DatePicker
                label="Fecha Inicio"
                value={filters.fechaInicio}
                onChange={(date) => handleFilterChange('fechaInicio', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <Box sx={{ width: '100%', maxWidth: { md: 200 } }}>
              <DatePicker
                label="Fecha Fin"
                value={filters.fechaFin}
                onChange={(date) => handleFilterChange('fechaFin', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <Box sx={{ width: '100%', maxWidth: { md: 150 } }}>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                disabled={!filters.grupoId || isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Aplicar Filtros'}
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
      
      {!hasFilters ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          Selecciona un grupo para ver las estadísticas de asistencia.
        </Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : asistencias && asistencias.length > 0 ? (
        <>
          {/* Overall Stats }*/
          /*
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Grupo</Typography>
                </Box>
                <Typography variant="h5">
                  {grupos?.find(g => g.ID_Grupo.toString() === filters.grupoId)?.Nombre || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de alumnos: {alumnos?.length || 0}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BookIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Materia</Typography>
                </Box>
                <Typography variant="h5">
                  {filters.materiaId 
                    ? materias?.find(m => m.ID_Materia.toString() === filters.materiaId)?.Nombre 
                    : 'Todas las materias'}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Periodo</Typography>
                </Box>
                <Typography variant="body1">
                  {format(filters.fechaInicio, 'dd MMM yyyy', { locale: es })} - {format(filters.fechaFin, 'dd MMM yyyy', { locale: es })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total registros: {overallStats.total}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssessmentIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Asistencia</Typography>
                </Box>
                <Typography variant="h4" color={
                  overallStats.tasa >= 80 ? 'success.main' : 
                  overallStats.tasa >= 60 ? 'warning.main' : 
                  'error.main'
                }>
                  {overallStats.tasa.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {overallStats.presentes} presentes / {overallStats.ausentes} ausentes
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          {/* Student Attendance Stats */
          /*
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Asistencia por Estudiante
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudiante</TableCell>
                    <TableCell align="center">Correo</TableCell>
                    <TableCell align="center">Total de Clases</TableCell>
                    <TableCell align="center">Asistencias</TableCell>
                    <TableCell align="right">Tasa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentStats.map((stat) => (
                    <TableRow key={stat.alumno.ID_Alumno}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {stat.alumno.Nombre}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{stat.alumno.Correo}</TableCell>
                      <TableCell align="center">{stat.total}</TableCell>
                      <TableCell align="center">
                        {stat.presentes} ({stat.total - stat.presentes} ausencias)
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${stat.tasa.toFixed(1)}%`}
                          color={
                            stat.tasa >= 80 ? 'success' : 
                            stat.tasa >= 60 ? 'warning' : 
                            'error'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {studentStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No hay datos disponibles</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* Attendance by Date 
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detalle de Asistencias por Fecha
            </Typography>
            
            {Object.keys(attendanceByDate).length === 0 ? (
              <Alert severity="info">No hay registros de asistencia para el período seleccionado.</Alert>
            ) : (
              Object.entries(attendanceByDate)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, dateAsistencias]) => (
                  <Box key={date} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">{formatDate(date)}</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Materia</TableCell>
                            <TableCell align="center">Estado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dateAsistencias.map((asistencia: Asistencia) => (
                            <TableRow key={asistencia.ID}>
                              <TableCell>{asistencia.Alumno.Nombre}</TableCell>
                              <TableCell>{asistencia.Horario.Materia.Nombre}</TableCell>
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
                  </Box>
                ))
            )}
          </Paper>
        </>
      ) : (
        <Alert severity="info">
          No se encontraron registros de asistencia con los filtros seleccionados.
        </Alert>
      )}
    </MainLayout>
  );
};

export default ReportesGrupo;
*/