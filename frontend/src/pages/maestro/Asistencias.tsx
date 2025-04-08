import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { format, parseISO, subMonths } from 'date-fns';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClassIcon from '@mui/icons-material/Class';

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

const MaestroAsistencias: React.FC = () => {
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    materiaId: 'todas',
    grupoId: 'todos',
    fechaInicio: subMonths(new Date(), 1), // Por defecto un mes atrás
    fechaFin: new Date() // Hoy
  });
  
  // Fetch horarios del maestro para obtener las materias y grupos
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['maestro', 'horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/horarios');
      return response.data as Horario[];
    }
  });
  
  // Fetch asistencias del maestro
  const { data: asistencias, isLoading: asistenciasLoading, error } = useQuery({
    queryKey: ['maestro', 'asistencias', filtros],
    queryFn: async () => {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      params.append('fechaInicio', filtros.fechaInicio.toISOString().split('T')[0]);
      params.append('fechaFin', filtros.fechaFin.toISOString().split('T')[0]);
      
      const response = await axiosInstance.get(`/maestros/me/asistencias?${params.toString()}`);
      return response.data as Asistencia[];
    }
  });
  
  // Extraer materias únicas para el filtro
  const materias = React.useMemo(() => {
    if (!horarios) return [];
    
    const materiasMap = new Map();
    horarios.forEach(horario => {
      const materia = horario.Materia;
      if (!materiasMap.has(materia.ID_Materia)) {
        materiasMap.set(materia.ID_Materia, {
          id: materia.ID_Materia,
          nombre: materia.Nombre
        });
      }
    });
    
    return Array.from(materiasMap.values());
  }, [horarios]);
  
  // Extraer grupos únicos para el filtro
  const grupos = React.useMemo(() => {
    if (!horarios) return [];
    
    const gruposMap = new Map();
    horarios.forEach(horario => {
      const grupo = horario.Grupo;
      if (!gruposMap.has(grupo.ID_Grupo)) {
        gruposMap.set(grupo.ID_Grupo, {
          id: grupo.ID_Grupo,
          nombre: grupo.Nombre
        });
      }
    });
    
    return Array.from(gruposMap.values());
  }, [horarios]);
  
  // Filtrar asistencias
  const asistenciasFiltradas = React.useMemo(() => {
    if (!asistencias) return [];
    
    return asistencias.filter(asistencia => {
      let cumpleFiltros = true;
      
      // Filtrar por materia
      if (filtros.materiaId !== 'todas') {
        cumpleFiltros = cumpleFiltros && 
          asistencia.Horario.Materia.ID_Materia.toString() === filtros.materiaId;
      }
      
      // Filtrar por grupo
      if (filtros.grupoId !== 'todos') {
        cumpleFiltros = cumpleFiltros &&
          asistencia.Horario.Grupo.ID_Grupo.toString() === filtros.grupoId;
      }
      
      return cumpleFiltros;
    });
  }, [asistencias, filtros]);
  
  // Estadísticas de asistencia
  const estadisticas = React.useMemo(() => {
    if (!asistenciasFiltradas.length) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tasaAsistencia: 0
      };
    }
    
    const total = asistenciasFiltradas.length;
    const presentes = asistenciasFiltradas.filter(a => a.Asistio).length;
    
    return {
      total,
      presentes,
      ausentes: total - presentes,
      tasaAsistencia: (presentes / total) * 100
    };
  }, [asistenciasFiltradas]);
  
  // Agrupar asistencias por fecha
  const asistenciasPorFecha = React.useMemo(() => {
    if (!asistenciasFiltradas.length) return {};
    
    const agrupadas = asistenciasFiltradas.reduce((acc, asistencia) => {
      const fecha = asistencia.Fecha.split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(asistencia);
      return acc;
    }, {} as Record<string, Asistencia[]>);
    
    // Ordenar por fecha (más reciente primero)
    return Object.keys(agrupadas)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc, key) => {
        acc[key] = agrupadas[key];
        return acc;
      }, {} as Record<string, Asistencia[]>);
  }, [asistenciasFiltradas]);
  
  // Handlers para filtros
  const handleMateriaChange = (event: SelectChangeEvent) => {
    setFiltros(prev => ({
      ...prev,
      materiaId: event.target.value
    }));
  };
  
  const handleGrupoChange = (event: SelectChangeEvent) => {
    setFiltros(prev => ({
      ...prev,
      grupoId: event.target.value
    }));
  };
  
  const handleFechaInicioChange = (date: Date | null) => {
    if (date) {
      setFiltros(prev => ({
        ...prev,
        fechaInicio: date
      }));
    }
  };
  
  const handleFechaFinChange = (date: Date | null) => {
    if (date) {
      setFiltros(prev => ({
        ...prev,
        fechaFin: date
      }));
    }
  };
  
  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string) => {
    try {
      return format(parseISO(fechaStr), 'dd MMMM yyyy', { locale: es });
    } catch {
      return fechaStr;
    }
  };
  
  // Formatear hora para mostrar
  const formatHora = (horaStr: string) => {
    try {
      const [horas, minutos] = horaStr.split(':');
      const fecha = new Date();
      fecha.setHours(parseInt(horas, 10));
      fecha.setMinutes(parseInt(minutos, 10));
      return format(fecha, 'h:mm a');
    } catch {
      return horaStr;
    }
  };
  
  const isLoading = horariosLoading || asistenciasLoading;
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Mis Asistencias
      </Typography>
      
      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '100%', md: '220px' } }}>
              <FormControl fullWidth>
                <InputLabel id="materia-select-label">Materia</InputLabel>
                <Select
                  labelId="materia-select-label"
                  id="materia-select"
                  value={filtros.materiaId}
                  label="Materia"
                  onChange={handleMateriaChange}
                >
                  <MenuItem value="todas">Todas las Materias</MenuItem>
                  {materias.map(materia => (
                    <MenuItem key={materia.id} value={materia.id.toString()}>
                      {materia.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '220px' } }}>
              <FormControl fullWidth>
                <InputLabel id="grupo-select-label">Grupo</InputLabel>
                <Select
                  labelId="grupo-select-label"
                  id="grupo-select"
                  value={filtros.grupoId}
                  label="Grupo"
                  onChange={handleGrupoChange}
                >
                  <MenuItem value="todos">Todos los Grupos</MenuItem>
                  {grupos.map(grupo => (
                    <MenuItem key={grupo.id} value={grupo.id.toString()}>
                      {grupo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '180px' } }}>
              <DatePicker
                label="Fecha Inicio"
                value={filtros.fechaInicio}
                onChange={handleFechaInicioChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '180px' } }}>
              <DatePicker
                label="Fecha Fin"
                value={filtros.fechaFin}
                onChange={handleFechaFinChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '150px' }, display: 'flex', alignItems: 'flex-start' }}>
              <Button
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ height: '56px' }} // Para alinear con los otros controles
              >
                {isLoading ? <CircularProgress size={24} /> : 'Aplicar Filtros'}
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
      
      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Clases
              </Typography>
              <Typography variant="h3" color="primary">
                {estadisticas.total}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asistencias
              </Typography>
              <Typography variant="h3" color="success.main">
                {estadisticas.presentes}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasa de Asistencia
              </Typography>
              <Typography 
                variant="h3" 
                color={
                  estadisticas.tasaAsistencia >= 90 ? 'success.main' :
                  estadisticas.tasaAsistencia >= 75 ? 'primary.main' :
                  estadisticas.tasaAsistencia >= 60 ? 'warning.main' :
                  'error.main'
                }
              >
                {estadisticas.tasaAsistencia.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Lista de Asistencias */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar los datos de asistencia. Por favor, intenta nuevamente.</Alert>
      ) : asistenciasFiltradas.length === 0 ? (
        <Alert severity="info">No se encontraron registros de asistencia con los filtros seleccionados.</Alert>
      ) : (
        <Box>
          {Object.entries(asistenciasPorFecha).map(([fecha, asistencias]) => (
            <Paper key={fecha} sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{formatFecha(fecha)}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Materia</TableCell>
                      <TableCell>Grupo</TableCell>
                      <TableCell>Horario</TableCell>
                      <TableCell>Salón</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asistencias.map((asistencia) => (
                      <TableRow key={asistencia.ID}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ClassIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {asistencia.Horario.Materia.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>{asistencia.Horario.Grupo.Nombre}</TableCell>
                        <TableCell>{formatHora(asistencia.Horario.HoraInicio)} - {formatHora(asistencia.Horario.HoraFin)}</TableCell>
                        <TableCell>{asistencia.Horario.Salon.Nombre}</TableCell>
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
            </Paper>
          ))}
        </Box>
      )}
    </MainLayout>
  );
};

export default MaestroAsistencias;