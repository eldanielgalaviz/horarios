// src/pages/jefe-grupo/RegistroAsistencia.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Alert, Tab, Tabs } from 'react-bootstrap';
import { format } from 'date-fns';
import HorarioTable from '../../components/HorarioTable';
import AsistenciaForm from '../../components/AsistenciaForm';
import ActividadForm from '../../components/ActividadForm';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
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

const RegistroAsistencia: React.FC = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [activeTab, setActiveTab] = useState<string>('asistencia');
  
  // Obtener horarios del grupo donde el estudiante es jefe
  const { data: horarios, isLoading, error } = useQuery({
    queryKey: ['horarios', 'jefe-grupo'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios/jefe-grupo');
      return response.data.horariosGrupo; // Solo los horarios del grupo
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

  // Mutation para registrar actividad
  const actividadMutation = useMutation({
    mutationFn: async (data: { 
      horarioId: number; 
      fecha: string; 
      tema: string; 
      actividades: string; 
      tareas: string;
    }) => {
      return axiosInstance.post('/actividades/registrar', data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    }
  });

  // Función para manejar registro de asistencia
  const handleRegistrarAsistencia = async (data: { 
    horarioId: number; 
    fecha: string; 
    presente: boolean; 
    observaciones: string;
  }) => {
    await asistenciaMutation.mutateAsync(data);
  };

  // Función para manejar registro de actividad
  const handleRegistrarActividad = async (data: { 
    horarioId: number; 
    fecha: string; 
    tema: string; 
    actividades: string; 
    tareas: string;
  }) => {
    await actividadMutation.mutateAsync(data);
  };

  // Verificar si el día actual coincide con el día del horario seleccionado
  const esDiaValido = (horario: Horario | null): boolean => {
    if (!horario) return false;
    
    const diaHoy = format(new Date(), 'EEEE', { locale: es });
    const capitalizedDiaHoy = diaHoy.charAt(0).toUpperCase() + diaHoy.slice(1);
    
    return capitalizedDiaHoy === horario.dia;
  };

  return (
    <MainLayout>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>Registro de Asistencia y Actividades</h2>
            <p>Como jefe de grupo, puedes registrar la asistencia de los profesores y las actividades realizadas en clase.</p>
          </Col>
        </Row>
        
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>Selecciona un horario</Card.Header>
              <Card.Body>
                {isLoading ? (
                  <p className="text-center">Cargando horarios...</p>
                ) : error ? (
                  <p className="text-center text-danger">Error al cargar horarios. Por favor, intenta nuevamente.</p>
                ) : (
                  <HorarioTable 
                    horarios={horarios || []}
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
                <Card.Header>
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k || 'asistencia')}
                    className="mb-3"
                  >
                    <Tab eventKey="asistencia" title="Asistencia">
                    </Tab>
                    <Tab eventKey="actividad" title="Actividad">
                    </Tab>
                  </Tabs>
                </Card.Header>
                <Card.Body>
                  {!esDiaValido(selectedHorario) && (
                    <Alert variant="warning">
                      Solo puedes registrar en el día correspondiente a la clase ({selectedHorario.dia}).
                    </Alert>
                  )}
                  
                  {activeTab === 'asistencia' ? (
                    <AsistenciaForm
                      horarioId={selectedHorario.id}
                      profesorNombre={selectedHorario.profesor.nombre}
                      materiaNombre={selectedHorario.materia.nombre}
                      onSubmit={handleRegistrarAsistencia}
                    />
                  ) : (
                    <ActividadForm
                      horarioId={selectedHorario.id}
                      profesorNombre={selectedHorario.profesor.nombre}
                      materiaNombre={selectedHorario.materia.nombre}
                      onSubmit={handleRegistrarActividad}
                    />
                  )}
                </Card.Body>
              </Card>
            ) : (
              <Card>
                <Card.Body className="text-center">
                  <p>Selecciona un horario para registrar asistencia o actividad.</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default RegistroAsistencia;