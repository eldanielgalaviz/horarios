import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SelectChangeEvent } from '@mui/material/Select';
import { UserRole } from '../../types/auth.types.ts';

// Interface definitions for different user types
interface Admin {
  ID: number;
  Nombre: string;
  Correo: string;
}

interface Maestro {
  ID_Maestro: number;
  Nombre: string;
  Correo: string;
  materias?: any[];
}

interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
  Grupo?: {
    ID_Grupo: number;
    Nombre: string;
  };
}

interface Checador {
  ID: number;
  Correo: string;
}

interface Grupo {
  ID_Grupo: number;
  Nombre: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Reusable TabPanel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    Contraseña: '',
    Grupo_ID: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const queryClient = useQueryClient();
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Fetch data for different user types
  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admins');
      return response.data as Admin[];
    },
    enabled: tabValue === 0
  });
  
  const { data: maestros, isLoading: maestrosLoading } = useQuery({
    queryKey: ['maestros'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros');
      return response.data as Maestro[];
    },
    enabled: tabValue === 1
  });
  
  const { data: alumnos, isLoading: alumnosLoading } = useQuery({
    queryKey: ['alumnos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/alumnos');
      return response.data as Alumno[];
    },
    enabled: tabValue === 2
  });
  
  const { data: checadores, isLoading: checadoresLoading } = useQuery({
    queryKey: ['checadores'],
    queryFn: async () => {
      const response = await axiosInstance.get('/checadores');
      return response.data as Checador[];
    },
    enabled: tabValue === 3
  });
  
  const { data: grupos } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  // Mutations for CRUD operations
  const addMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getCurrentEndpoint()] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'User added successfully',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error adding user',
        severity: 'error'
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, id, data }: { endpoint: string; id: number; data: any }) => {
      const response = await axiosInstance.put(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getCurrentEndpoint()] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating user',
        severity: 'error'
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: number }) => {
      await axiosInstance.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getCurrentEndpoint()] });
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting user',
        severity: 'error'
      });
    }
  });
  
  // Get current endpoint based on selected tab
  const getCurrentEndpoint = () => {
    switch (tabValue) {
      case 0: return 'admins';
      case 1: return 'maestros';
      case 2: return 'alumnos';
      case 3: return 'checadores';
      default: return '';
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    const endpoint = `/${getCurrentEndpoint()}`;
    
    if (dialogType === 'add') {
      // Create new user
      let data = {};
      
      switch (tabValue) {
        case 0: // Admin
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña,
          };
          break;
        case 1: // Teacher
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña,
          };
          break;
        case 2: // Student
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña,
            Grupo_ID: parseInt(formData.Grupo_ID)
          };
          break;
        case 3: // Checker
          data = {
            Correo: formData.Correo,
            Contraseña: formData.Contraseña,
          };
          break;
      }
      
      addMutation.mutate({ endpoint, data });
    } else if (dialogType === 'edit') {
      // Update existing user
      let data = {};
      let id;
      
      switch (tabValue) {
        case 0: // Admin
          id = currentUser.ID;
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña || undefined,
          };
          break;
        case 1: // Teacher
          id = currentUser.ID_Maestro;
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña || undefined,
          };
          break;
        case 2: // Student
          id = currentUser.ID_Alumno;
          data = {
            Nombre: formData.Nombre,
            Correo: formData.Correo,
            Contraseña: formData.Contraseña || undefined,
            Grupo_ID: parseInt(formData.Grupo_ID)
          };
          break;
        case 3: // Checker
          id = currentUser.ID;
          data = {
            Correo: formData.Correo,
            Contraseña: formData.Contraseña || undefined,
          };
          break;
      }
      
      updateMutation.mutate({ endpoint, id, data });
    } else if (dialogType === 'delete') {
      // Delete user
      let id;
      
      switch (tabValue) {
        case 0: id = currentUser.ID; break;
        case 1: id = currentUser.ID_Maestro; break;
        case 2: id = currentUser.ID_Alumno; break;
        case 3: id = currentUser.ID; break;
      }
      
      deleteMutation.mutate({ endpoint, id });
    }
  };
  
  // Handle dialog open for different operations
  const handleAddClick = () => {
    setDialogType('add');
    setCurrentUser(null);
    setFormData({
      Nombre: '',
      Correo: '',
      Contraseña: '',
      Grupo_ID: '',
    });
    setOpenDialog(true);
  };
  
  const handleEditClick = (user: any) => {
    setDialogType('edit');
    setCurrentUser(user);
    
    // Set form data based on user type
    if (tabValue === 0 || tabValue === 1) { // Admin or Teacher
      setFormData({
        Nombre: user.Nombre,
        Correo: user.Correo,
        Contraseña: '',
        Grupo_ID: '',
      });
    } else if (tabValue === 2) { // Student
      setFormData({
        Nombre: user.Nombre,
        Correo: user.Correo,
        Contraseña: '',
        Grupo_ID: user.Grupo?.ID_Grupo.toString() || '',
      });
    } else if (tabValue === 3) { // Checker
      setFormData({
        Nombre: '',
        Correo: user.Correo,
        Contraseña: '',
        Grupo_ID: '',
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleDeleteClick = (user: any) => {
    setDialogType('delete');
    setCurrentUser(user);
    setOpenDialog(true);
  };
  
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Loading indicators for each tab
  const isLoading = () => {
    switch (tabValue) {
      case 0: return adminsLoading;
      case 1: return maestrosLoading;
      case 2: return alumnosLoading;
      case 3: return checadoresLoading;
      default: return false;
    }
  };
  
  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add New User
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Administrators" />
          <Tab label="Teachers" />
          <Tab label="Students" />
          <Tab label="Attendance Checkers" />
        </Tabs>
        
        {/* Administrators Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading() ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : admins && admins.length > 0 ? (
                  admins.map((admin) => (
                    <TableRow key={admin.ID}>
                      <TableCell>{admin.ID}</TableCell>
                      <TableCell>{admin.Nombre}</TableCell>
                      <TableCell>{admin.Correo}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditClick(admin)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteClick(admin)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No administrators found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Teachers Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subjects</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading() ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : maestros && maestros.length > 0 ? (
                  maestros.map((maestro) => (
                    <TableRow key={maestro.ID_Maestro}>
                      <TableCell>{maestro.ID_Maestro}</TableCell>
                      <TableCell>{maestro.Nombre}</TableCell>
                      <TableCell>{maestro.Correo}</TableCell>
                      <TableCell>{maestro.materias?.length || 0}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditClick(maestro)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteClick(maestro)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No teachers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Students Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading() ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : alumnos && alumnos.length > 0 ? (
                  alumnos.map((alumno) => (
                    <TableRow key={alumno.ID_Alumno}>
                      <TableCell>{alumno.ID_Alumno}</TableCell>
                      <TableCell>{alumno.Nombre}</TableCell>
                      <TableCell>{alumno.Correo}</TableCell>
                      <TableCell>{alumno.Grupo?.Nombre || 'No group'}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditClick(alumno)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Attendance Checkers Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading() ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : checadores && checadores.length > 0 ? (
                  checadores.map((checador) => (
                    <TableRow key={checador.ID}>
                      <TableCell>{checador.ID}</TableCell>
                      <TableCell>{checador.Correo}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditClick(checador)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
                      No attendance checkers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
      
      {/* Dialog for Add/Edit/Delete */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'add' && 'Add New User'}
          {dialogType === 'edit' && 'Edit User'}
          {dialogType === 'delete' && 'Delete User'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          ) : (
            <>
              {/* Show Name field for all except Checadores */}
              {tabValue !== 3 && (
                <TextField
                  autoFocus
                  margin="dense"
                  name="Nombre"
                  label="Name"
                  type="text"
                  fullWidth
                  value={formData.Nombre}
                  onChange={handleChange}
                  required
                />
              )}
              
              <TextField
                margin="dense"
                name="Correo"
                label="Email"
                type="email"
                fullWidth
                value={formData.Correo}
                onChange={handleChange}
                required
              />
              
              <TextField
                margin="dense"
                name="Contraseña"
                label={dialogType === 'edit' ? "New Password (leave empty to keep current)" : "Password"}
                type="password"
                fullWidth
                value={formData.Contraseña}
                onChange={handleChange}
                required={dialogType === 'add'}
              />
              
              {/* Show Group selection for Students */}
              {tabValue === 2 && (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="grupo-label">Group</InputLabel>
                  <Select
                    labelId="grupo-label"
                    name="Grupo_ID"
                    value={formData.Grupo_ID}
                    onChange={handleChange}
                    label="Group"
                    required
                  >
                    {grupos?.map((grupo) => (
                      <MenuItem key={grupo.ID_Grupo} value={grupo.ID_Grupo.toString()}>
                        {grupo.Nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color={dialogType === 'delete' ? 'error' : 'primary'}
            disabled={
              addMutation.isPending || 
              updateMutation.isPending || 
              deleteMutation.isPending
            }
          >
            {dialogType === 'add' && (addMutation.isPending ? 'Adding...' : 'Add')}
            {dialogType === 'edit' && (updateMutation.isPending ? 'Saving...' : 'Save')}
            {dialogType === 'delete' && (deleteMutation.isPending ? 'Deleting...' : 'Delete')}
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

export default UserManagement;
