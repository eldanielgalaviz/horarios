import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LoginCredentials, UserRole } from '../../types/auth.types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { 
  Button, 
  TextField, 
  FormControl, 
  FormHelperText, 
  InputLabel, 
  MenuItem, 
  Select, 
  CircularProgress,
  Typography,
  Box,
  Paper
} from '@mui/material';

const LoginSchema = Yup.object().shape({
  correo: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  contraseña: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
  userType: Yup.string()
    .oneOf(Object.values(UserRole), 'Invalid user type')
    .required('User type is required'),
});

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  const initialValues: LoginCredentials = {
    correo: '',
    contraseña: '',
    userType: UserRole.ALUMNO, // Default selection
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          School Management System
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Log in to access your account
        </Typography>
        
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            await login(values);
          }}
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
                label="Password"
                type="password"
                margin="normal"
                variant="outlined"
                value={values.contraseña}
                onChange={handleChange}
                error={touched.contraseña && Boolean(errors.contraseña)}
                helperText={touched.contraseña && errors.contraseña}
              />
              
              <FormControl fullWidth margin="normal" error={touched.userType && Boolean(errors.userType)}>
                <InputLabel id="userType-label">User Type</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userType"
                  name="userType"
                  value={values.userType}
                  label="User Type"
                  onChange={handleChange}
                >
                  <MenuItem value={UserRole.ALUMNO}>Student</MenuItem>
                  <MenuItem value={UserRole.MAESTRO}>Teacher</MenuItem>
                  <MenuItem value={UserRole.CHECADOR}>Attendance Checker</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                </Select>
                {touched.userType && errors.userType && (
                  <FormHelperText>{errors.userType}</FormHelperText>
                )}
              </FormControl>
              
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default LoginForm;
