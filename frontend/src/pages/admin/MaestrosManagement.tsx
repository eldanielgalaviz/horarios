import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Snackbar,
  DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';

interface Maestro {
  ID_Maestro: number;
  Nombre: string;
  Correo: string;
  materias?: any[];
}

interface CreateMaestroDto {
  Nombre: string;
  Correo: string;
  Contraseña: string;
}

const MaestroManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentMaestro, setCurrentMaestro] = useState<Maestro | null>(null);
  const [formData, setFormData] = useState<CreateMaestroDto>({
    Nombre: '',
    Correo: '',
    Contraseña: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch all teachers
  const { data: maestros, isLoading } = useQuery({
    queryKey: ['maestros'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros');
      return response.data as Maestro[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateMaestroDto) => {
      const response = await axiosInstance.post('/maestros', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maestros'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Profesor creado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear el profesor',
        severity: 'error'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateMaestroDto }) => {
      const response = await axiosInstance.put(`/maestros/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maestros'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Profesor actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el profesor',
        severity: 'error'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/maestros/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maestros'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Profesor eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar el profesor',
        severity: 'error'
      });
    }
  });

  // Handle open dialog for add
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentMaestro(null);
    setFormData({
      Nombre: '',
      Correo: '',
      Contraseña: '',
    });
    setOpenDialog(true);
  };

  // Handle open dialog for edit
  const handleEditClick = (maestro: Maestro) => {
    setDialogType('edit');
    setCurrentMaestro(maestro);
    setFormData({
      Nombre: maestro.Nombre,
      Correo: maestro.Correo,
      Contraseña: '', // Password field is empty when editing
    });
    setOpenDialog(true);
  };

  // Handle open dialog for delete
  const handleDeleteClick = (maestro: Maestro) => {
    setDialogType('delete');
    setCurrentMaestro(maestro);
    setOpenDialog(true);
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogType === 'add') {
      if (!formData.Nombre || !formData.Correo || !formData.Contraseña) {
        setSnackbar({
          open: true,
          message: 'Todos los campos son obligatorios',
          severity: 'error'
        });
        return;
      }
      createMutation.mutate(formData);
    } else if (dialogType === 'edit' && currentMaestro) {
      if (!formData.Nombre || !formData.Correo) {
        setSnackbar({
          open: true,
          message: 'Nombre y correo son obligatorios',
          severity: 'error'
        });
        return;
      }
      // If password is empty, don't update it
      const updateData = formData.Contraseña 
        ? formData 
        : { Nombre: formData.Nombre, Correo: formData.Correo };
      
      updateMutation.mutate({ id: currentMaestro.ID_Maestro, data: updateData as CreateMaestroDto });
    } else if (dialogType === 'delete' && currentMaestro) {
      deleteMutation.mutate(currentMaestro.ID_Maestro);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Profesores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nuevo Profesor
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Materias</TableCell>
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
              ) : maestros && maestros.length > 0 ? (
                maestros.map((maestro) => (
                  <TableRow key={maestro.ID_Maestro}>
                    <TableCell>{maestro.ID_Maestro}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {maestro.Nombre}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {maestro.Correo}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${maestro.materias?.length || 0} materias`} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(maestro)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          onClick={() => handleDeleteClick(maestro)}
                          disabled={maestro.materias && maestro.materias.length > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron profesores
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
          {dialogType === 'add' && 'Agregar Nuevo Profesor'}
          {dialogType === 'edit' && 'Editar Profesor'}
          {dialogType === 'delete' && 'Eliminar Profesor'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              ¿Está seguro de que desea eliminar al profesor <strong>{currentMaestro?.Nombre}</strong>?
              {currentMaestro?.materias && currentMaestro.materias.length > 0 && (
                <Box sx={{ mt: 2, color: 'error.main' }}>
                  Este profesor tiene materias asignadas. Debe reasignar las materias antes de eliminar al profesor.
                </Box>
              )}
            </DialogContentText>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                name="Nombre"
                label="Nombre completo"
                type="text"
                fullWidth
                value={formData.Nombre}
                onChange={handleChange}
                required
              />

              <TextField
                margin="dense"
                name="Correo"
                label="Correo electrónico"
                type="email"
                fullWidth
                value={formData.Correo}
                onChange={handleChange}
                required
              />

              <TextField
                margin="dense"
                name="Contraseña"
                label={dialogType === 'edit' ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"}
                type="password"
                fullWidth
                value={formData.Contraseña}
                onChange={handleChange}
                required={dialogType === 'add'}
              />
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
              isPending || 
              (dialogType === 'delete' && currentMaestro?.materias && currentMaestro.materias.length > 0)
            }
          >
            {isPending ? <CircularProgress size={24} /> : (
              dialogType === 'add' ? 'Crear' :
              dialogType === 'edit' ? 'Guardar' :
              'Eliminar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default MaestroManagement;