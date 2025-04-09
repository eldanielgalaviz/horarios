// src/pages/estudiante/HorariosEstudiante.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Row, Col, Card } from 'react-bootstrap';
import HorarioTable from '../../components/HorarioTable';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axios';

const HorariosEstudiante: React.FC = () => {
  const { authState } = useAuth();
  
  // Obtener horarios del estudiante
  const { data: horarios, isLoading, error } = useQuery({
    queryKey: ['horarios', 'estudiante'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios/estudiante');
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
              <Card.Body>
                {isLoading ? (
                  <p className="text-center">Cargando horarios...</p>
                ) : error ? (
                  <p className="text-center text-danger">Error al cargar horarios. Por favor, intenta nuevamente.</p>
                ) : (
                  <HorarioTable horarios={horarios || []} />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default HorariosEstudiante;
