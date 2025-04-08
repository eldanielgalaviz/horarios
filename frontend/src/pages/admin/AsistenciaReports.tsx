// src/pages/admin/AsistenciaReports.tsx
import React, { useState } from 'react';
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
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import PieChartIcon from '@mui/icons-material/PieChart';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
}

interface Maestro {
  ID_Maestro: number;
  Nombre: string;
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
  };
  Asistio: boolean;
  Fecha: string;
  FechaRegistro: string;
}

const AsistenciaReports: React.FC = () => {
  const [filters, setFilters] = useState({
    grupoId: 'all',
    maestroId: 'all',
    fechaInicio: subMonths(new Date(), 1), // Por defecto 1 mes atrás
    fechaFin: new Date() // Hoy
  });
  
  // Fetch all groups
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  // Fetch all teachers
  const { data: maestros, isLoading: maestrosLoading } = useQuery({
    queryKey: ['maestros'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros');
      return response.data as Maestro[];
    }
  });
  
  // Fetch attendance data
  const { data: asistencias, isLoading: asistenciasLoading, error } = useQuery({
    queryKey: ['asistencias', filters],
    queryFn: async () => {
      // Construir la URL base
      let url = '/asistencias';
      
      // Agregar parámetros según los filtros
      const params = new URLSearchParams();
      params.append('fechaInicio', filters.fechaInicio.toISOString().split('T')[0]);
      params.append('fechaFin', filters.fechaFin.toISOString().split('T')[0]);
      
      if (filters.grupoId !== 'all') {
        url = `/asistencias/grupo/${filters.grupoId}/fecha`;
      } else if (filters.maestroId !== 'all') {
        url = `/asistencias/maestro/${filters.maestroId}/fecha`;
      } else {
        url = `/asistencias/fecha/rango`;
      }
      
      const response = await axiosInstance.get(`${url}?${params.toString()}`);
      return response.data as Asistencia[];
    },
    enabled: !gruposLoading && !maestrosLoading
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
  
  // Format time for display
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
  
  // Calculate attendance statistics
  const calculateStats = () => {
    if (!asistencias || asistencias.length === 0) {
      return {
        totalRegistros: 0,
        presentCount: 0,
        absentCount: 0,
        asistenciaRate: 0,
        gruposStats: [],
        maestrosStats: []
      };
    }
    
    const totalRegistros = asistencias.length;
    const presentCount = asistencias.filter(a => a.Asistio).length;
    const absentCount = totalRegistros - presentCount;
    const asistenciaRate = (presentCount / totalRegistros) * 100;
    
    // Estadísticas por grupo
    const grupoMap = new Map();
    asistencias.forEach(a => {
      const grupoId = a.Horario.Grupo.ID_Grupo;
      const grupoNombre = a.Horario.Grupo.Nombre;
      
      if (!grupoMap.has(grupoId)) {
        grupoMap.set(grupoId, {
          id: grupoId,
          nombre: grupoNombre,
          total: 0,
          present: 0
        });
      }
      
      const grupoStats = grupoMap.get(grupoId);
      grupoStats.total++;
      if (a.Asistio) grupoStats.present++;
    });
    
    const gruposStats = Array.from(grupoMap.values()).map(stats => ({
      ...stats,
      rate: (stats.present / stats.total) * 100
    }));
    
    // Estadísticas por maestro
    const maestroMap = new Map();
    asistencias.forEach(a => {
      const maestroId = a.Horario.Materia.Maestro.ID_Maestro;
      const maestroNombre = a.Horario.Materia.Maestro.Nombre;
      
      if (!maestroMap.has(maestroId)) {
        maestroMap.set(maestroId, {
          id: maestroId,
          nombre: maestroNombre,
          total: 0,
          present: 0
        });
      }
      
      const maestroStats = maestroMap.get(maestroId);
      maestroStats.total++;
      if (a.Asistio) maestroStats.present++;
    });
    
    const maestrosStats = Array.from(maestroMap.values()).map(stats => ({
      ...stats,
      rate: (stats.present / stats.total) * 100
    }));
    
    return {
      totalRegistros,
      presentCount,
      absentCount,
      asistenciaRate,
      gruposStats,
      maestrosStats
    };
  };
  
  const stats = calculateStats();
  
  // Agrupamos las asistencias por fecha para mostrarlas organizadas
  const groupByDate = () => {
    if (!asistencias) return {};
    
    const grouped = asistencias.reduce((acc, asistencia) => {
      const date = asistencia.Fecha.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(asistencia);
      return acc;
    }, {} as Record<string, Asistencia[]>);
    
    // Ordenar por fecha (más reciente primero)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, Asistencia[]>);
  };
  
  const asistenciasByDate = groupByDate();
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Reportes de Asistencia
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
                <MenuItem value="all">Todos los grupos</MenuItem>
                {grupos?.map((grupo) => (
                  <MenuItem key={grupo.ID_Grupo} value={grupo.ID_Grupo.toString()}>
                    {grupo.Nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ maxWidth: { md: 200 } }}>
              <InputLabel id="maestro-label">Profesor</InputLabel>
              <Select
                labelId="maestro-label"
                value={filters.maestroId}
                label="Profesor"
                onChange={(e) => handleFilterChange('maestroId', e.target.value)}
              >
                <MenuItem value="all">Todos los profesores</MenuItem>
                {maestros?.map((maestro) => (
                  <MenuItem key={maestro.ID_Maestro} value={maestro.ID_Maestro.toString()}>
                    {maestro.Nombre}
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
                disabled={asistenciasLoading}
              >
                {asistenciasLoading ? <CircularProgress size={24} /> : 'Filtrar'}
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
      
      {/* Estadísticas de Asistencia */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Registros</Typography>
            </Box>
            <Typography variant="h3" color="text.primary">
              {stats.totalRegistros}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PieChartIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Tasa de Asistencia</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {stats.asistenciaRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.presentCount} presentes / {stats.absentCount} ausentes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Grupos</Typography>
            </Box>
            <Typography variant="h3" color="text.primary">
              {stats.gruposStats.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.gruposStats.length > 0 && 
                `Mejor: ${stats.gruposStats.sort((a, b) => b.rate - a.rate)[0]?.nombre}`}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '220px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">Profesores</Typography>
            </Box>
            <Typography variant="h3" color="text.primary">
              {stats.maestrosStats.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.maestrosStats.length > 0 && 
                `Mejor: ${stats.maestrosStats.sort((a, b) => b.rate - a.rate)[0]?.nombre}`}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Top Grupos y Maestros */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2, flexGrow: 1, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Asistencia por Grupo
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Grupo</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Asistencia</TableCell>
                  <TableCell align="right">Tasa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.gruposStats.sort((a, b) => b.rate - a.rate).map((grupo) => (
                  <TableRow key={grupo.id}>
                    <TableCell>{grupo.nombre}</TableCell>
                    <TableCell align="center">{grupo.total}</TableCell>
                    <TableCell align="center">{grupo.present}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${grupo.rate.toFixed(1)}%`}
                        color={grupo.rate >= 80 ? 'success' : grupo.rate >= 60 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {stats.gruposStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay datos disponibles</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Paper sx={{ p: 2, flexGrow: 1, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Asistencia por Profesor
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Profesor</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Asistencia</TableCell>
                  <TableCell align="right">Tasa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.maestrosStats.sort((a, b) => b.rate - a.rate).map((maestro) => (
                  <TableRow key={maestro.id}>
                    <TableCell>{maestro.nombre}</TableCell>
                    <TableCell align="center">{maestro.total}</TableCell>
                    <TableCell align="center">{maestro.present}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${maestro.rate.toFixed(1)}%`}
                        color={maestro.rate >= 80 ? 'success' : maestro.rate >= 60 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {stats.maestrosStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay datos disponibles</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      
      {/* Listado de Asistencias */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registro Detallado de Asistencias
        </Typography>
        
        {asistenciasLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error al cargar los datos de asistencia</Alert>
        ) : asistencias && asistencias.length > 0 ? (
          Object.entries(asistenciasByDate).map(([date, asistenciasList]) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{formatDate(date)}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell>Profesor</TableCell>
                      <TableCell>Horario</TableCell>
                      <TableCell>Salón</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asistenciasList.map((asistencia) => (
                      <TableRow key={asistencia.ID}>
                        <TableCell>{asistencia.Horario.Grupo.Nombre}</TableCell>
                        <TableCell>{asistencia.Horario.Materia.Nombre}</TableCell>
                        <TableCell>{asistencia.Horario.Materia.Maestro.Nombre}</TableCell>
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
            </Box>
          ))
        ) : (
          <Alert severity="info">No se encontraron registros de asistencia para los filtros seleccionados</Alert>
        )}
      </Paper>
    </MainLayout>
  );
};

export default AsistenciaReports;