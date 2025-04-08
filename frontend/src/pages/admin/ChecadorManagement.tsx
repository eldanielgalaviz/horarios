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
  Snackbar,
  DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface Checador {
  ID: number;
  Correo: string;
}

interface CreateChecadorDto {
  Correo: string;
  Contraseña: string;
}

const ChecadorManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentChecador, setCurrentChecador] = useState<Checador | null>(null);
  const [formData, setFormData] = useState<CreateChecadorDto>({
    Correo: '',
    Contraseña: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch all checadores
  const { data: checadores, isLoading } = useQuery({
    queryKey: ['checadores'],
    queryFn: async () => {
      const response = await axiosInstance.get('/checadores');
      return response.data as Checador[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateChecadorDto) => {
      const response = await axiosInstance.post('/checadores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checadores'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Supervisor de asistencia creado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear el supervisor',
        severity: 'error'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateChecadorDto }) => {
      const response = await axiosInstance.put(`/checadores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checadores'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Supervisor de asistencia actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el supervisor',
        severity: 'error'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/checadores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checadores'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Supervisor de asistencia eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar el supervisor',
        severity: 'error'
      });
    }
  });

  // Handle open dialog for add
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentChecador(null);
    setFormData({
      Correo: '',
      Contraseña: '',
    });
    setOpenDialog(true);
  };

  // Handle open dialog for edit
  const handleEditClick = (checador: Checador) => {
    setDialogType('edit');
    setCurrentChecador(checador);
    setFormData({
      Correo: checador.Correo,
      Contraseña: '', // Password field is empty when editing
    });
    setOpenDialog(true);
  };

  // Handle open dialog for delete
  const handleDeleteClick = (checador: Checador) => {
    setDialogType('delete');
    setCurrentChecador(checador);
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
      if (!formData.Correo || !formData.Contraseña) {
        setSnackbar({
          open: true,
          message: 'Todos los campos son obligatorios',
          severity: 'error'
        });
        return;
      }
      createMutation.mutate(formData);
    } else if (dialogType === 'edit' && currentChecador) {
      if (!formData.Correo) {
        setSnackbar({
          open: true,
          message: 'El correo es obligatorio',
          severity: 'error'
        });
        return;
      }
      // If password is empty, don't update it
      const updateData = formData.Contraseña 
        ? formData 
        : { Correo: formData.Correo };
      
      updateMutation.mutate({ id: currentChecador.ID, data: updateData as CreateChecadorDto });
    } else if (dialogType === 'delete' && currentChecador) {
      deleteMutation.mutate(currentChecador.ID);
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
          Gestión de Supervisores de Asistencia
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nuevo Supervisor
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : checadores && checadores.length > 0 ? (
                checadores.map((checador) => (
                  <TableRow key={checador.ID}>
                    <TableCell>{checador.ID}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <SupervisorAccountIcon sx={{ color: 'primary.main', mr: 1 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {checador.Correo}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(checador)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(checador)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No se encontraron supervisores de asistencia
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
          {dialogType === 'add' && 'Agregar Nuevo Supervisor'}
          {dialogType === 'edit' && 'Editar Supervisor'}
          {dialogType === 'delete' && 'Eliminar Supervisor'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              ¿Está seguro de que desea eliminar al supervisor con correo <strong>{currentChecador?.Correo}</strong>?
            </DialogContentText>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
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
            disabled={isPending}
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

export default ChecadorManagement;