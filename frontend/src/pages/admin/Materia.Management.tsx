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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Maestro {
  ID_Maestro: number;
  Nombre: string;
}

interface Salon {
  ID_Salon: number;
  Nombre: string;
}

interface Materia {
  ID_Materia: number;
  Nombre: string;
  Maestro: Maestro;
  Salon: Salon;
}

interface CreateMateriaDto {
  Nombre: string;
  Maestro_ID: number;
  Salon_ID: number;
}

const MateriaManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentMateria, setCurrentMateria] = useState<Materia | null>(null);
  const [formData, setFormData] = useState<CreateMateriaDto>({
    Nombre: '',
    Maestro_ID: 0,
    Salon_ID: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const queryClient = useQueryClient();
  
  // Fetch all subjects
  const { data: materias, isLoading: materiasLoading } = useQuery({
    queryKey: ['materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/materias');
      return response.data as Materia[];
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
  
  // Fetch all classrooms
  const { data: salones, isLoading: salonesLoading } = useQuery({
    queryKey: ['salones'],
    queryFn: async () => {
      const response = await axiosInstance.get('/salones');
      return response.data as Salon[];
    }
  });
  
  // Create new subject
  const createMutation = useMutation({
    mutationFn: async (data: CreateMateriaDto) => {
      const response = await axiosInstance.post('/materias', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Materia creada exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear la materia',
        severity: 'error'
      });
    }
  });
  
  // Update existing subject
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateMateriaDto }) => {
      const response = await axiosInstance.put(`/materias/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Materia actualizada exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar la materia',
        severity: 'error'
      });
    }
  });
  
  // Delete subject
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/materias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materias'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Materia eliminada exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar la materia',
        severity: 'error'
      });
    }
  });
  
  // Handle add button click
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentMateria(null);
    setFormData({
      Nombre: '',
      Maestro_ID: 0,
      Salon_ID: 0
    });
    setOpenDialog(true);
  };
  
  // Handle edit button click
  const handleEditClick = (materia: Materia) => {
    setDialogType('edit');
    setCurrentMateria(materia);
    setFormData({
      Nombre: materia.Nombre,
      Maestro_ID: materia.Maestro.ID_Maestro,
      Salon_ID: materia.Salon.ID_Salon
    });
    setOpenDialog(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (materia: Materia) => {
    setDialogType('delete');
    setCurrentMateria(materia);
    setOpenDialog(true);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as keyof CreateMateriaDto;
    const value = e.target.value;
    
    setFormData({
      ...formData,
      [name]: name === 'Nombre' ? value : Number(value)
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (dialogType === 'add') {
      createMutation.mutate(formData);
    } else if (dialogType === 'edit' && currentMateria) {
      updateMutation.mutate({ id: currentMateria.ID_Materia, data: formData });
    } else if (dialogType === 'delete' && currentMateria) {
      deleteMutation.mutate(currentMateria.ID_Materia);
    }
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const isFormValid = () => {
    return formData.Nombre && formData.Maestro_ID > 0 && formData.Salon_ID > 0;
  };
  
  const isLoading = materiasLoading || maestrosLoading || salonesLoading;
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Materias
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nueva Materia
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Salón</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : materias && materias.length > 0 ? (
                materias.map((materia) => (
                  <TableRow key={materia.ID_Materia}>
                    <TableCell>{materia.ID_Materia}</TableCell>
                    <TableCell>{materia.Nombre}</TableCell>
                    <TableCell>{materia.Maestro.Nombre}</TableCell>
                    <TableCell>{materia.Salon.Nombre}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(materia)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(materia)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron materias
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog for Add/Edit/Delete */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' && 'Agregar Nueva Materia'}
          {dialogType === 'edit' && 'Editar Materia'}
          {dialogType === 'delete' && 'Eliminar Materia'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Typography>
              ¿Está seguro de que desea eliminar la materia <strong>{currentMateria?.Nombre}</strong>?
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
                name="Nombre"
                label="Nombre de la Materia"
                type="text"
                fullWidth
                value={formData.Nombre}
                onChange={handleChange as any}
                required
              />
              
              <FormControl fullWidth>
                <InputLabel id="maestro-label">Profesor</InputLabel>
                <Select
                  labelId="maestro-label"
                  name="Maestro_ID"
                  value={formData.Maestro_ID}
                  onChange={handleChange as any}
                  label="Profesor"
                  required
                >
                  <MenuItem value={0} disabled>Seleccione un profesor</MenuItem>
                  {maestros?.map((maestro) => (
                    <MenuItem key={maestro.ID_Maestro} value={maestro.ID_Maestro}>
                      {maestro.Nombre}
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
                  onChange={handleChange as any}
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

export default MateriaManagement;
