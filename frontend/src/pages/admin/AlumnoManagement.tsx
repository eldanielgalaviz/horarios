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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  DialogContentText,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
}

interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
  Grupo: Grupo;
}

interface CreateAlumnoDto {
  Nombre: string;
  Correo: string;
  Contraseña: string;
  Grupo_ID: number;
}

const AlumnoManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentAlumno, setCurrentAlumno] = useState<Alumno | null>(null);
  const [formData, setFormData] = useState<CreateAlumnoDto>({
    Nombre: '',
    Correo: '',
    Contraseña: '',
    Grupo_ID: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch all students
  const { data: alumnos, isLoading: alumnosLoading } = useQuery({
    queryKey: ['alumnos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos');
      return response.data as Alumno[];
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAlumnoDto) => {
      const response = await axiosInstance.post('/alumnos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Estudiante creado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear el estudiante',
        severity: 'error'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateAlumnoDto }) => {
      const response = await axiosInstance.put(`/alumnos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Estudiante actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el estudiante',
        severity: 'error'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/alumnos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Estudiante eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar el estudiante',
        severity: 'error'
      });
    }
  });

  // Handle open dialog for add
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentAlumno(null);
    setFormData({
      Nombre: '',
      Correo: '',
      Contraseña: '',
      Grupo_ID: 0,
    });
    setOpenDialog(true);
  };

  // Handle open dialog for edit
  const handleEditClick = (alumno: Alumno) => {
    setDialogType('edit');
    setCurrentAlumno(alumno);
    setFormData({
      Nombre: alumno.Nombre,
      Correo: alumno.Correo,
      Contraseña: '', // Password field is empty when editing
      Grupo_ID: alumno.Grupo.ID_Grupo,
    });
    setOpenDialog(true);
  };

  // Handle open dialog for delete
  const handleDeleteClick = (alumno: Alumno) => {
    setDialogType('delete');
    setCurrentAlumno(alumno);
    setOpenDialog(true);
  };

  // Handle form text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form select changes
  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      Grupo_ID: Number(e.target.value)
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogType === 'add') {
      if (!formData.Nombre || !formData.Correo || !formData.Contraseña || !formData.Grupo_ID) {
        setSnackbar({
          open: true,
          message: 'Todos los campos son obligatorios',
          severity: 'error'
        });
        return;
      }
      createMutation.mutate(formData);
    } else if (dialogType === 'edit' && currentAlumno) {
      if (!formData.Nombre || !formData.Correo || !formData.Grupo_ID) {
        setSnackbar({
          open: true,
          message: 'Nombre, correo y grupo son obligatorios',
          severity: 'error'
        });
        return;
      }
      // If password is empty, don't update it
      const updateData = formData.Contraseña 
        ? formData 
        : { 
            Nombre: formData.Nombre, 
            Correo: formData.Correo, 
            Grupo_ID: formData.Grupo_ID 
          };
      
      updateMutation.mutate({ id: currentAlumno.ID_Alumno, data: updateData as CreateAlumnoDto });
    } else if (dialogType === 'delete' && currentAlumno) {
      deleteMutation.mutate(currentAlumno.ID_Alumno);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isLoading = alumnosLoading || gruposLoading;
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Estudiantes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nuevo Estudiante
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
                <TableCell>Grupo</TableCell>
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
              ) : alumnos && alumnos.length > 0 ? (
                alumnos.map((alumno) => (
                  <TableRow key={alumno.ID_Alumno}>
                    <TableCell>{alumno.ID_Alumno}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {alumno.Nombre}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {alumno.Correo}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<GroupIcon />}
                        label={alumno.Grupo.Nombre} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(alumno)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(alumno)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron estudiantes
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
          {dialogType === 'add' && 'Agregar Nuevo Estudiante'}
          {dialogType === 'edit' && 'Editar Estudiante'}
          {dialogType === 'delete' && 'Eliminar Estudiante'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              ¿Está seguro de que desea eliminar al estudiante <strong>{currentAlumno?.Nombre}</strong>?
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
                onChange={handleInputChange}
                required
              />

              <TextField
                margin="dense"
                name="Correo"
                label="Correo electrónico"
                type="email"
                fullWidth
                value={formData.Correo}
                onChange={handleInputChange}
                required
              />

              <TextField
                margin="dense"
                name="Contraseña"
                label={dialogType === 'edit' ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"}
                type="password"
                fullWidth
                value={formData.Contraseña}
                onChange={handleInputChange}
                required={dialogType === 'add'}
              />

              <FormControl fullWidth margin="dense">
                <InputLabel id="grupo-label">Grupo</InputLabel>
                <Select
                  labelId="grupo-label"
                  value={formData.Grupo_ID}
                  label="Grupo"
                  onChange={handleSelectChange}
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

export default AlumnoManagement;