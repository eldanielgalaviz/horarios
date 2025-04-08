// src/pages/admin/GrupoManagement.tsx
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
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
  alumnos?: any[];
}

interface CreateGrupoDto {
  Nombre: string;
}

const GrupoManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentGrupo, setCurrentGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({
    Nombre: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const queryClient = useQueryClient();
  
  // Fetch all groups
  const { data: grupos, isLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  // Create new group
  const createMutation = useMutation({
    mutationFn: async (data: CreateGrupoDto) => {
      const response = await axiosInstance.post('/grupos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Grupo creado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear el grupo',
        severity: 'error'
      });
    }
  });
  
  // Update existing group
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateGrupoDto }) => {
      const response = await axiosInstance.put(`/grupos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Grupo actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el grupo',
        severity: 'error'
      });
    }
  });
  
  // Delete group
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/grupos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Grupo eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar el grupo',
        severity: 'error'
      });
    }
  });
  
  // Handle add button click
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentGrupo(null);
    setFormData({
      Nombre: '',
    });
    setOpenDialog(true);
  };
  
  // Handle edit button click
  const handleEditClick = (grupo: Grupo) => {
    setDialogType('edit');
    setCurrentGrupo(grupo);
    setFormData({
      Nombre: grupo.Nombre,
    });
    setOpenDialog(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (grupo: Grupo) => {
    setDialogType('delete');
    setCurrentGrupo(grupo);
    setOpenDialog(true);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (dialogType === 'add') {
      createMutation.mutate(formData);
    } else if (dialogType === 'edit' && currentGrupo) {
      updateMutation.mutate({ id: currentGrupo.ID_Grupo, data: formData });
    } else if (dialogType === 'delete' && currentGrupo) {
      deleteMutation.mutate(currentGrupo.ID_Grupo);
    }
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Grupos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nuevo Grupo
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Estudiantes</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : grupos && grupos.length > 0 ? (
                grupos.map((grupo) => (
                  <TableRow key={grupo.ID_Grupo}>
                    <TableCell>{grupo.ID_Grupo}</TableCell>
                    <TableCell>{grupo.Nombre}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={<GroupIcon />} 
                        label={`${grupo.alumnos?.length || 0} estudiantes`}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(grupo)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          onClick={() => handleDeleteClick(grupo)}
                          disabled={grupo.alumnos && grupo.alumnos.length > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No se encontraron grupos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog for Add/Edit/Delete */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'add' && 'Agregar Nuevo Grupo'}
          {dialogType === 'edit' && 'Editar Grupo'}
          {dialogType === 'delete' && 'Eliminar Grupo'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              ¿Está seguro de que desea eliminar el grupo <strong>{currentGrupo?.Nombre}</strong>?
              {currentGrupo?.alumnos && currentGrupo.alumnos.length > 0 && (
                <Box sx={{ mt: 2, color: 'error.main' }}>
                  Este grupo tiene estudiantes asignados. Por favor, reasigne los estudiantes antes de eliminar el grupo.
                </Box>
              )}
            </DialogContentText>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              name="Nombre"
              label="Nombre del Grupo"
              type="text"
              fullWidth
              value={formData.Nombre}
              onChange={handleChange}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={dialogType === 'delete' ? 'error' : 'primary'}
            disabled={
              (dialogType === 'delete' && currentGrupo?.alumnos && currentGrupo.alumnos.length > 0) ||
              createMutation.isPending || 
              updateMutation.isPending || 
              deleteMutation.isPending ||
              (dialogType !== 'delete' && !formData.Nombre)
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

export default GrupoManagement;