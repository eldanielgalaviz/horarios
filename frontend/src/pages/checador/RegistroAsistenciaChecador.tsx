// src/pages/checador/RegistroAsistenciaChecador.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import HorarioTable from '../../components/HorarioTable';
import AsistenciaForm from '../../components/AsistenciaForm';
import MainLayout from '../../components/layout/MainLayout';
import axiosInstance from '../../api/axios';

interface Horario {
  id: number;
  materia: {
    id: number;
    nombre: string;
  };
  profesor: {
    id: number;
    nombre: string;
  };
  grupo: {
    id: number;
    nombre: string;
  };
  aula: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

const RegistroAsistenciaChecador: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [filtroProfesor, setFiltroProfesor] = useState<string>('');
  
  // Obtener todos los horarios
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['horarios', 'checador'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios');
      return response.data;
    }
  });

  // Obtener grupos para filtro
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data;
    }
  });

  // Obtener profesores para filtro
  const { data: profesores, isLoading: profesoresLoading } = useQuery({
    queryKey: ['profesores'],
    queryFn: async () => {
      const response = await axiosInstance.get('/profesores');
      return response.data;
    }
  });

  // Mutation para registrar asistencia
  const asistenciaMutation = useMutation({
    mutationFn: async (data: { 
      horarioId: number; 
      fecha: string; 
      presente: boolean; 
      observaciones: string;
    }) => {
      return axiosInstance.post('/asistencias/registrar', data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['asistencias'] });
    }
  });

  // Filtrar horarios según los criterios seleccionados
  const horariosFiltrados = React.useMemo(() => {
    if (!horarios) return [];
    
    return horarios.filter(horario => {
      // Filtrar por grupo si hay un filtro seleccionado
      if (filtroGrupo && horario.grupo.id.toString() !== filtroGrupo) {
        return false;
      }
      
      // Filtrar por profesor si hay un filtro seleccionado
      if (filtroProfesor && horario.profesor.id.toString() !== filtroProfesor) {
        return false;
      }
      
      return true;
    });
  }, [horarios, filtroGrupo, filtroProfesor]);

  // Función para manejar registro de asistencia
  const handleRegistrarAsistencia = async (data: { 
    horarioId: number; 
    fecha: string; 
    presente: boolean; 
    observaciones: string;
  }) => {
    await asistenciaMutation.mutateAsync(data);
  };

  return (
    <MainLayout>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>Registro de Asistencia - Checador</h2>
            <p>Registra la asistencia de los profesores en los diferentes horarios.</p>
          </Col>
        </Row>
        
        {/* Filtros */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Filtros</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grupo</Form.Label>
                      <Form.Select 
                        value={filtroGrupo} 
                        onChange={(e) => setFiltroGrupo(e.target.value)}
                      >
                        <option value="">Todos los grupos</option>
                        {grupos?.map(grupo => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Profesor</Form.Label>
                      <Form.Select 
                        value={filtroProfesor} 
                        onChange={(e) => setFiltroProfesor(e.target.value)}
                      >
                        <option value="">Todos los profesores</option>
                        {profesores?.map(profesor => (
                          <option key={profesor.id} value={profesor.id}>
                            {profesor.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>Horarios</Card.Header>
              <Card.Body>
                {horariosLoading ? (
                  <p className="text-center">Cargando horarios...</p>
                ) : (
                  <HorarioTable 
                    horarios={horariosFiltrados}
                    showGrupo={true}
                    showActions={true}
                    onSelectHorario={setSelectedHorario}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            {selectedHorario ? (
              <Card>
                <Card.Header>Registrar Asistencia</Card.Header>
                <Card.Body>
                  <AsistenciaForm
                    horarioId={selectedHorario.id}
                    profesorNombre={selectedHorario.profesor.nombre}
                    materiaNombre={selectedHorario.materia.nombre}
                    onSubmit={handleRegistrarAsistencia}
                  />
                </Card.Body>
              </Card>
            ) : (
              <Card>
                <Card.Body className="text-center">
                  <p>Selecciona un horario para registrar asistencia.</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default RegistroAsistenciaChecador;