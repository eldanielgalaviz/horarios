import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { UserRole } from '../types/auth.types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import SchoolIcon from '@mui/icons-material/School';

// Define el esquema de validación usando Yup
const LoginSchema = Yup.object().shape({
  correo: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  contraseña: Yup.string()
    .min(4, 'La contraseña debe tener al menos 4 caracteres')
    .required('La contraseña es requerida'),
  userType: Yup.string()
    .oneOf(Object.values(UserRole), 'Tipo de usuario inválido')
    .required('El tipo de usuario es requerido'),
});

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { correo: string; contraseña: string; userType: UserRole }) => {
    await login(values);
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Sistema Escolar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Inicia sesión para acceder a tu cuenta
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            correo: '',
            contraseña: '',
            userType: UserRole.ALUMNO,
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, values }) => (
            <Form>
              <TextField
                fullWidth
                id="correo"
                name="correo"
                label="Email"
                margin="normal"
                variant="outlined"
                value={values.correo}
                onChange={handleChange}
                error={touched.correo && Boolean(errors.correo)}
                helperText={touched.correo && errors.correo}
              />
              
              <TextField
                fullWidth
                id="contraseña"
                name="contraseña"
                label="Contraseña"
                type="password"
                margin="normal"
                variant="outlined"
                value={values.contraseña}
                onChange={handleChange}
                error={touched.contraseña && Boolean(errors.contraseña)}
                helperText={touched.contraseña && errors.contraseña}
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                error={touched.userType && Boolean(errors.userType)}
              >
                <InputLabel id="userType-label">Tipo de Usuario</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userType"
                  name="userType"
                  value={values.userType}
                  label="Tipo de Usuario"
                  onChange={handleChange}
                >
                  <MenuItem value={UserRole.ALUMNO}>Estudiante</MenuItem>
                  <MenuItem value={UserRole.MAESTRO}>Profesor</MenuItem>
                  <MenuItem value={UserRole.CHECADOR}>Supervisor de Asistencia</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                </Select>
                {touched.userType && errors.userType && (
                  <FormHelperText>{errors.userType}</FormHelperText>
                )}
              </FormControl>
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default Login;