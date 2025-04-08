import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';

interface Materia {
  ID_Materia: number;
  Nombre: string;
  Salon: {
    ID_Salon: number;
    Nombre: string;
  };
  Maestro: {
    ID_Maestro: number;
    Nombre: string;
  };
}

const MisMaterias: React.FC = () => {
  // Fetch teacher's subjects
  const { data: materias, isLoading, error } = useQuery({
    queryKey: ['maestro', 'materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/maestros/me/materias');
      return response.data as Materia[];
    }
  });

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        My Subjects
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error loading subjects</Alert>
      ) : (
        <>
          {/* Statistics */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            marginBottom: 4 
          }}>
            <Card sx={{ flex: '1 1 300px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Total Subjects</Typography>
                </Box>
                <Typography variant="h4">{materias?.length || 0}</Typography>
              </CardContent>
            </Card>
          </Box>
          
          {/* Subjects Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject Name</TableCell>
                  <TableCell>
                    <MeetingRoomIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Classroom
                  </TableCell>
                  <TableCell>
                    <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Teacher
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materias && materias.length > 0 ? (
                  materias.map((materia) => (
                    <TableRow key={materia.ID_Materia}>
                      <TableCell>{materia.Nombre}</TableCell>
                      <TableCell>{materia.Salon.Nombre}</TableCell>
                      <TableCell>{materia.Maestro.Nombre}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No subjects assigned
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </MainLayout>
  );
};

export default MisMaterias;