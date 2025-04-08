import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
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
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { format, parseISO, subMonths, isValid } from 'date-fns';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClassIcon from '@mui/icons-material/Class';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
}

interface Materia {
  ID_Materia: number;
  Nombre: string;
  Maestro: {
    ID_Maestro: number;
    Nombre: string;
  };
}

interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
}

interface Horario {
  ID: number;
  Grupo: Grupo;
  Materia: Materia;
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

const CheckadorReports: React.FC = () => {
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    grupoId: '',
    materiaId: '',
    fechaInicio: subMonths(new Date(), 1), // Por defecto un mes atrás
    fechaFin: new Date() // Hoy
  });
  
  // Fetch grupos
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  // Fetch materias
  const { data: materias, isLoading: materiasLoading } = useQuery({
    queryKey: ['materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/materias');
      return response.data as Materia[];
    }
  });
  
  // Fetch asistencias según filtros
  const { data: asistencias, isLoading: asistenciasLoading } = useQuery({
    queryKey: ['asistencias', filtros],
    queryFn: async () => {
      if (!filtros.grupoId && !filtros.materiaId) {
        // Obtener todas las asistencias si no hay filtros específicos
        return [] as Asistencia[];
      }

      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // Asegurar que las fechas son válidas
      if (isValid(filtros.fechaInicio)) {
        params.append('fechaInicio', filtros.fechaInicio.toISOString().split('T')[0]);
      }
      
      if (isValid(filtros.fechaFin)) {
        params.append('fechaFin', filtros.fechaFin.toISOString().split('T')[0]);
      }
      
      let url = '';
      
      // Determinar la URL basada en los filtros
      if (filtros.grupoId) {
        url = `/asistencias/grupo/${filtros.grupoId}/fecha?${params.toString()}`;
      } else {
        url = `/asistencias/fecha/rango?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      let asistencias = response.data as Asistencia[];
      
      // Filtrar por materia si es necesario (en el cliente)
      if (filtros.materiaId) {
        asistencias = asistencias.filter(
          a => a.Horario.Materia.ID_Materia.toString() === filtros.materiaId
        );
      }
      
      return asistencias;
    },
    enabled: !!(filtros.grupoId || filtros.materiaId) // Solo habilitar si hay al menos un filtro
  });
  
  // Handlers para cambios en filtros
  const handleGrupoChange = (event: SelectChangeEvent) => {
    setFiltros(prev => ({
      ...prev,
      grupoId: event.target.value
    }));
  };
  
  const handleMateriaChange = (event: SelectChangeEvent) => {
    setFiltros(prev => ({
      ...prev,
      materiaId: event.target.value
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
  
  // Agrupar asistencias por fecha
  const asistenciasPorFecha = React.useMemo(() => {
    if (!asistencias?.length) return {};
    
    const agrupadas = asistencias.reduce((acc, asistencia) => {
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
  }, [asistencias]);
  
  // Calcular estadísticas
  const estadisticas = React.useMemo(() => {
    if (!asistencias?.length) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tasaAsistencia: 0
      };
    }
    
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.Asistio).length;
    
    return {
      total,
      presentes,
      ausentes: total - presentes,
      tasaAsistencia: (presentes / total) * 100
    };
  }, [asistencias]);
  
  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string) => {
    try {
      return format(parseISO(fechaStr), 'PPPP', { locale: es });
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
  
  const isLoading = gruposLoading || materiasLoading || asistenciasLoading;
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Reportes de Asistencia
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
                <InputLabel id="grupo-select-label">Grupo</InputLabel>
                <Select
                  labelId="grupo-select-label"
                  id="grupo-select"
                  value={filtros.grupoId}
                  label="Grupo"
                  onChange={handleGrupoChange}
                >
                  <MenuItem value="">Todos los grupos</MenuItem>
                  {grupos?.map((grupo) => (
                    <MenuItem key={grupo.ID_Grupo} value={grupo.ID_Grupo.toString()}>
                      {grupo.Nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
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
                  <MenuItem value="">Todas las materias</MenuItem>
                  {materias?.map((materia) => (
                    <MenuItem key={materia.ID_Materia} value={materia.ID_Materia.toString()}>
                      {materia.Nombre}
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
                startIcon={<SearchIcon />}
                disabled={isLoading}
                sx={{ height: '56px' }} // Para alinear con los otros controles
              >
                {isLoading ? <CircularProgress size={24} /> : 'Buscar'}
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Paper>
      
      {/* Estadísticas */}
      {asistencias && asistencias.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Registros</Typography>
                </Box>
                <Typography variant="h3">{estadisticas.total}</Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Asistencias</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {estadisticas.presentes} ({estadisticas.tasaAsistencia.toFixed(1)}%)
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CancelIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Faltas</Typography>
                </Box>
                <Typography variant="h3" color="error.main">
                  {estadisticas.ausentes} ({(100 - estadisticas.tasaAsistencia).toFixed(1)}%)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
      
      {/* Resultados */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : !filtros.grupoId && !filtros.materiaId ? (
        <Alert severity="info">
          Seleccione al menos un grupo o materia para ver el reporte de asistencias.
        </Alert>
      ) : asistencias && asistencias.length === 0 ? (
        <Alert severity="info">
          No se encontraron registros de asistencia con los filtros seleccionados.
        </Alert>
      ) : (
        <Box>
          {Object.entries(asistenciasPorFecha).map(([fecha, asistenciasDia]) => (
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
                      <TableCell>Grupo</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell>Profesor</TableCell>
                      <TableCell>Horario</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asistenciasDia.map((asistencia) => (
                      <TableRow key={asistencia.ID}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {asistencia.Horario.Grupo.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ClassIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {asistencia.Horario.Materia.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {asistencia.Horario.Materia.Maestro.Nombre}
                          </Box>
                        </TableCell>
                        <TableCell>{formatHora(asistencia.Horario.HoraInicio)} - {formatHora(asistencia.Horario.HoraFin)}</TableCell>
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

export default CheckadorReports;