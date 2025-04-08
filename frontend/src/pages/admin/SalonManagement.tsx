// src/pages/admin/HorarioManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout';
import axiosInstance from '../../api/axios';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';

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

interface Salon {
  ID_Salon: number;
  Nombre: string;
}

interface Horario {
  ID: number;
  Grupo: Grupo;
  Materia: Materia;
  Salon: Salon;
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

interface CreateHorarioDto {
  Grupo_ID: number;
  Materia_ID: number;
  Salon_ID: number;
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

const HorarioManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentHorario, setCurrentHorario] = useState<Horario | null>(null);
  const [formData, setFormData] = useState<{
    Grupo_ID: number;
    Materia_ID: number;
    Salon_ID: number;
    HoraInicio: Date | null;
    HoraFin: Date | null;
    Dias: Date | null;
  }>({
    Grupo_ID: 0,
    Materia_ID: 0,
    Salon_ID: 0,
    HoraInicio: null,
    HoraFin: null,
    Dias: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const queryClient = useQueryClient();
  
  // Fetch all schedules
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios');
      return response.data as Horario[];
    }
  });
  
  // Fetch all groups
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  // Fetch all subjects
  const { data: materias, isLoading: materiasLoading } = useQuery({
    queryKey: ['materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/materias');
      return response.data as Materia[];
    }
  });
  
  // Fetch all classrooms
  const { data: salones, isLoading: salonesLoading } = useQuery({
    queryKey: ['salones'],
    queryFn: async () => {
      const response = await axiosInstance.get('/salones');
      return response.data as Salon[];
    }
  });
  
  // Create new schedule
  const createMutation = useMutation({
    mutationFn: async (data: CreateHorarioDto) => {
      const response = await axiosInstance.post('/horarios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Horario creado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear el horario',
        severity: 'error'
      });
    }
  });
  
  // Update existing schedule
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateHorarioDto }) => {
      const response = await axiosInstance.put(`/horarios/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Horario actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el horario',
        severity: 'error'
      });
    }
  });
  
  // Delete schedule
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/horarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Horario eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar el horario',
        severity: 'error'
      });
    }
  });
  
  // Handle add button click
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentHorario(null);
    setFormData({
      Grupo_ID: 0,
      Materia_ID: 0,
      Salon_ID: 0,
      HoraInicio: null,
      HoraFin: null,
      Dias: null,
    });
    setOpenDialog(true);
  };
  
  // Handle edit button click
  const handleEditClick = (horario: Horario) => {
    setDialogType('edit');
    setCurrentHorario(horario);
    
    // Parse strings to Date objects
    const horaInicio = parseTimeString(horario.HoraInicio);
    const horaFin = parseTimeString(horario.HoraFin);
    const dias = new Date(horario.Dias);
    
    setFormData({
      Grupo_ID: horario.Grupo.ID_Grupo,
      Materia_ID: horario.Materia.ID_Materia,
      Salon_ID: horario.Salon.ID_Salon,
      HoraInicio: horaInicio,
      HoraFin: horaFin,
      Dias: dias,
    });
    setOpenDialog(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (horario: Horario) => {
    setDialogType('delete');
    setCurrentHorario(horario);
    setOpenDialog(true);
  };
  
  // Parse time string to Date object (e.g., "14:30:00" -> Date)
  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };
  
  // Format Date to time string (e.g., Date -> "14:30:00")
  const formatTimeToString = (date: Date): string => {
    return format(date, 'HH:mm:00');
  };
  
  // Format Date to date string (e.g., Date -> "2023-10-25")
  const formatDateToString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Handle form input changes
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as keyof typeof formData;
    const value = e.target.value;
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle time picker changes
  const handleTimeChange = (name: 'HoraInicio' | 'HoraFin', newValue: Date | null) => {
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };
  
  // Handle date picker change
  const handleDateChange = (newValue: Date | null) => {
    setFormData({
      ...formData,
      Dias: newValue,
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid()) return;
    
    const submissionData: CreateHorarioDto = {
      Grupo_ID: formData.Grupo_ID,
      Materia_ID: formData.Materia_ID,
      Salon_ID: formData.Salon_ID,
      HoraInicio: formatTimeToString(formData.HoraInicio as Date),
      HoraFin: formatTimeToString(formData.HoraFin as Date),
      Dias: formatDateToString(formData.Dias as Date),
    };
    
    if (dialogType === 'add') {
      createMutation.mutate(submissionData);
    } else if (dialogType === 'edit' && currentHorario) {
      updateMutation.mutate({ id: currentHorario.ID, data: submissionData });
    } else if (dialogType === 'delete' && currentHorario) {
      deleteMutation.mutate(currentHorario.ID);
    }
  };
  
  // Validate form
  const isFormValid = (): boolean => {
    if (dialogType === 'delete') return true;
    
    return (
      formData.Grupo_ID > 0 &&
      formData.Materia_ID > 0 &&
      formData.Salon_ID > 0 &&
      formData.HoraInicio !== null &&
      formData.HoraFin !== null &&
      formData.Dias !== null
    );
  };
  
  // Format time for display (19:30:00 -> 7:30 PM)
  const formatTimeForDisplay = (timeStr: string): string => {
    const date = parseTimeString(timeStr);
    return format(date, 'h:mm a');
  };
  
  // Format date for display (2023-10-25 -> Oct 25, 2023)
  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };
  
  // Get day of week from date
  const getDayOfWeek = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'EEEE', { locale: es });
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const isLoading = horariosLoading || gruposLoading || materiasLoading || salonesLoading;
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Horarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nuevo Horario
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Salón</TableCell>
                <TableCell>Horario</TableCell>
                <TableCell>Día</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : horarios && horarios.length > 0 ? (
                horarios.map((horario) => (
                  <TableRow key={horario.ID}>
                    <TableCell>{horario.ID}</TableCell>
                    <TableCell>{horario.Grupo.Nombre}</TableCell>
                    <TableCell>{horario.Materia.Nombre}</TableCell>
                    <TableCell>{horario.Materia.Maestro.Nombre}</TableCell>
                    <TableCell>{horario.Salon.Nombre}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={<AccessTimeIcon />} 
                        label={`${formatTimeForDisplay(horario.HoraInicio)} - ${formatTimeForDisplay(horario.HoraFin)}`}
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<EventIcon />} 
                        label={getDayOfWeek(horario.Dias)}
                        variant="outlined"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(horario)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(horario)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron horarios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog for Add/Edit/Delete */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'add' && 'Agregar Nuevo Horario'}
            {dialogType === 'edit' && 'Editar Horario'}
            {dialogType === 'delete' && 'Eliminar Horario'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'delete' ? (
              <Typography>
                ¿Está seguro de que desea eliminar este horario?
                <Box sx={{ mt: 2 }}>
                  <strong>Grupo:</strong> {currentHorario?.Grupo.Nombre}<br />
                  <strong>Materia:</strong> {currentHorario?.Materia.Nombre}<br />
                  <strong>Profesor:</strong> {currentHorario?.Materia.Maestro.Nombre}<br />
                  <strong>Salón:</strong> {currentHorario?.Salon.Nombre}<br />
                  <strong>Horario:</strong> {currentHorario && `${formatTimeForDisplay(currentHorario.HoraInicio)} - ${formatTimeForDisplay(currentHorario.HoraFin)}`}<br />
                  <strong>Día:</strong> {currentHorario && getDayOfWeek(currentHorario.Dias)}
                </Box>
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="grupo-label">Grupo</InputLabel>
                  <Select
                    labelId="grupo-label"
                    name="Grupo_ID"
                    value={formData.Grupo_ID}
                    onChange={handleSelectChange as any}
                    label="Grupo"
                    required
                  >
                    <MenuItem value={0} disabled>Seleccione un grupo</MenuItem>
                    {grupos?.map((grupo) => (
                      <MenuItem key={grupo.ID_Grupo} value={grupo.ID_Grupo}>
                        {grupo.Nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel id="materia-label">Materia</InputLabel>
                  <Select
                    labelId="materia-label"
                    name="Materia_ID"
                    value={formData.Materia_ID}
                    onChange={handleSelectChange as any}
                    label="Materia"
                    required
                  >
                    <MenuItem value={0} disabled>Seleccione una materia</MenuItem>
                    {materias?.map((materia) => (
                      <MenuItem key={materia.ID_Materia} value={materia.ID_Materia}>
                        {materia.Nombre} - {materia.Maestro.Nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel id="salon-label">Salón</InputLabel>
                  <Select
                    labelId="salon-label"
                    name="Salon_ID"
                    value={formData.Salon_ID}
                    onChange={handleSelectChange as any}
                    label="Salón"
                    required
                  >
                    <MenuItem value={0} disabled>Seleccione un salón</MenuItem>
                    {salones?.map((salon) => (
                      <MenuItem key={salon.ID_Salon} value={salon.ID_Salon}>
                        {salon.Nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 1 }}>
                  <DatePicker 
                    label="Día de la Semana"
                    value={formData.Dias}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <TimePicker 
                    label="Hora de Inicio"
                    value={formData.HoraInicio}
                    onChange={(newValue) => handleTimeChange('HoraInicio', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <TimePicker 
                    label="Hora de Fin"
                    value={formData.HoraFin}
                    onChange={(newValue) => handleTimeChange('HoraFin', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={dialogType === 'delete' ? 'error' : 'primary'}
              disabled={
                createMutation.isPending || 
                updateMutation.isPending || 
                deleteMutation.isPending ||
                (dialogType !== 'delete' && !isFormValid())
              }
            >
              {dialogType === 'add' && (createMutation.isPending ? 'Creando...' : 'Crear')}
              {dialogType === 'edit' && (updateMutation.isPending ? 'Guardando...' : 'Guardar')}
              {dialogType === 'delete' && (deleteMutation.isPending ? 'Eliminando...' : 'Eliminar')}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      
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

export default HorarioManagement;