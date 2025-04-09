// src/pages/profesor/HorariosProfesor.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import HorarioTable from '../../components/HorarioTable';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axios';

const HorariosProfesor: React.FC = () => {
  const { authState } = useAuth();
  
  // Obtener horarios del profesor
  const { data: horarios, isLoading, error } = useQuery({
    queryKey: ['horarios', 'profesor'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios/profesor');
      return response.data;
    }
  });

  return (
    <MainLayout>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>Mis Horarios</h2>
            <p>Bienvenido(a) {authState.user?.nombre}. Aquí puedes ver tus horarios asignados.</p>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Card>
              <Card.Header>Horarios Asignados</Card.Header>
              <Card.Body>
                {isLoading ? (
                  <p className="text-center">Cargando horarios...</p>
                ) : error ? (
                  <Alert variant="danger">
                    Error al cargar los horarios. Por favor, intenta nuevamente.
                  </Alert>
                ) : !horarios || horarios.length === 0 ? (
                  <Alert variant="info">
                    No tienes horarios asignados actualmente.
                  </Alert>
                ) : (
                  <HorarioTable 
                    horarios={horarios}
                    showGrupo={true}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default HorariosProfesor;