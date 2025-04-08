import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Box,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, parseISO } from 'date-fns';

interface Asistencia {
  ID: number;
  Horario: {
    ID: number;
    HoraInicio: string;
    HoraFin: string;
    Materia: {
      ID_Materia: number;
      Nombre: string;
    };
    Salon: {
      ID_Salon: number;
      Nombre: string;
    };
  };
  Asistio: boolean;
  Fecha: string;
  FechaRegistro: string;
}

const AlumnoAsistencias: React.FC = () => {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  // Fetch student attendance
  const { data: asistencias, isLoading, error } = useQuery({
    queryKey: ['asistencias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos/me/asistencias');
      return response.data as Asistencia[];
    }
  });
  
  // Extract unique subjects for filter
  const subjects = asistencias 
    ? [...new Set(asistencias.map(a => a.Horario.Materia.Nombre))]
    : [];
  
  // Filter attendance records
  const filteredAsistencias = asistencias 
    ? (subjectFilter === 'all' 
        ? asistencias 
        : asistencias.filter(a => a.Horario.Materia.Nombre === subjectFilter))
    : [];
  
  // Calculate statistics
  const totalClasses = filteredAsistencias.length;
  const presentCount = filteredAsistencias.filter(a => a.Asistio).length;
  const absentCount = totalClasses - presentCount;
  const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };
  
  // Handle subject filter change
  const handleFilterChange = (event: SelectChangeEvent) => {
    setSubjectFilter(event.target.value);
  };
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        My Attendance
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error loading attendance records</Alert>
      ) : (
        <>
          {/* Statistics Cards */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 4 
            }}
          >
            {/* Total Classes Card */}
            <Box sx={{ flex: 1, width: { xs: '100%', md: '33.333%' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Classes
                  </Typography>
                  <Typography variant="h4">{totalClasses}</Typography>
                </CardContent>
              </Card>
            </Box>
            
            {/* Present Card */}
            <Box sx={{ flex: 1, width: { xs: '100%', md: '33.333%' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Present
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {presentCount} ({Math.round(attendanceRate)}%)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            {/* Absent Card */}
            <Box sx={{ flex: 1, width: { xs: '100%', md: '33.333%' } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Absent
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {absentCount} ({Math.round(100 - attendanceRate)}%)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Filter */}
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="subject-filter-label">Filter by Subject</InputLabel>
              <Select
                labelId="subject-filter-label"
                id="subject-filter"
                value={subjectFilter}
                label="Filter by Subject"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Subjects</MenuItem>
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Attendance Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAsistencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAsistencias.map((asistencia) => (
                    <TableRow key={asistencia.ID}>
                      <TableCell>{formatDate(asistencia.Fecha)}</TableCell>
                      <TableCell>{asistencia.Horario.Materia.Nombre}</TableCell>
                      <TableCell>{asistencia.Horario.HoraInicio} - {asistencia.Horario.HoraFin}</TableCell>
                      <TableCell>{asistencia.Horario.Salon.Nombre}</TableCell>
                      <TableCell>
                        {asistencia.Asistio ? (
                          <Chip 
                            icon={<CheckCircleIcon />} 
                            label="Present" 
                            color="success" 
                            size="small"
                          />
                        ) : (
                          <Chip 
                            icon={<CancelIcon />} 
                            label="Absent" 
                            color="error" 
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(asistencia.FechaRegistro)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </MainLayout>
  );
};

export default AlumnoAsistencias;