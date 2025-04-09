// src/pages/admin/AsignacionHorarios.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Table,
  Modal
} from 'react-bootstrap';
import MainLayout from '../../components/layout/MainLayout';
import axiosInstance from '../../api/axios';
import { ChangeEvent, FormEvent } from 'react';

interface Grupo {
  id: number;
  nombre: string;
  carrera: string;
  semestre: number;
}

interface Profesor {
  id: number;
  nombre: string;
  departamento: string;
}

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  profesorId: number;
}

interface Horario {
  id: number;
  materiaId: number;
  grupoId: number;
  profesorId: number;
  aula: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

const AsignacionHorarios: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Estado para el formulario
  const [formData, setFormData] = useState<{
    materiaId: string;
    grupoId: string;
    profesorId: string;
    aula: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
  }>({
    materiaId: '',
    grupoId: '',
    profesorId: '',
    aula: '',
    dia: '',
    horaInicio: '',
    horaFin: '',
  });
  
  // Estado para la edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Consultas para obtener datos
  const { data: grupos, isLoading: gruposLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await axiosInstance.get('/grupos');
      return response.data as Grupo[];
    }
  });
  
  const { data: profesores, isLoading: profesoresLoading } = useQuery({
    queryKey: ['profesores'],
    queryFn: async () => {
      const response = await axiosInstance.get('/profesores');
      return response.data as Profesor[];
    }
  });
  
  const { data: materias, isLoading: materiasLoading } = useQuery({
    queryKey: ['materias'],
    queryFn: async () => {
      const response = await axiosInstance.get('/materias');
      return response.data as Materia[];
    }
  });
  
  const { data: horarios, isLoading: horariosLoading } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const response = await axiosInstance.get('/horarios');
      return response.data as Horario[];
    }
  });
  
  // Mutaciones para operaciones CRUD
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post('/horarios', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      resetForm();
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return axiosInstance.put(`/horarios/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      resetForm();
      setEditingId(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/horarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  });
  
  // Función para manejar cambios en el formulario
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Función para cargar datos de un horario para editar
  const loadForEdit = (horario: Horario) => {
    setFormData({
      materiaId: horario.materiaId.toString(),
      grupoId: horario.grupoId.toString(),
      profesorId: horario.profesorId.toString(),
      aula: horario.aula,
      dia: horario.dia,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
    });
    setEditingId(horario.id);
  };
  
  // Función para confirmación de eliminación
  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      materiaId: '',
      grupoId: '',
      profesorId: '',
      aula: '',
      dia: '',
      horaInicio: '',
      horaFin: '',
    });
  };
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  
  // Función para manejar envío del formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const data = {
      materiaId: parseInt(formData.materiaId),
      grupoId: parseInt(formData.grupoId),
      profesorId: parseInt(formData.profesorId),
      aula: formData.aula,
      dia: formData.dia,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Función para encontrar nombres en lugar de IDs
  const getNombreMateria = (id: number) => {
    return materias?.find(m => m.id === id)?.nombre || 'No disponible';
  };
  
  const getNombreGrupo = (id: number) => {
    return grupos?.find(g => g.id === id)?.nombre || 'No disponible';
  };
  
  const getNombreProfesor = (id: number) => {
    return profesores?.find(p => p.id === id)?.nombre || 'No disponible';
  };
  
  const isLoading = gruposLoading || profesoresLoading || materiasLoading || horariosLoading;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <MainLayout>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>{editingId ? 'Editar Horario' : 'Crear Nuevo Horario'}</h2>
          </Col>
        </Row>
        
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>{editingId ? 'Editar Horario' : 'Nuevo Horario'}</Card.Header>
              <Card.Body>
                {isLoading ? (
                  <p className="text-center">Cargando datos...</p>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Materia</Form.Label>
                      <Form.Select 
                        name="materiaId"
                        value={formData.materiaId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona una materia</option>
                        {materias?.map(materia => (
                          <option key={materia.id} value={materia.id}>
                            {materia.nombre} ({materia.codigo})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Grupo</Form.Label>
                      <Form.Select 
                        name="grupoId"
                        value={formData.grupoId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un grupo</option>
                        {grupos?.map(grupo => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nombre} - {grupo.carrera} (Sem: {grupo.semestre})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Profesor</Form.Label>
                      <Form.Select 
                        name="profesorId"
                        value={formData.profesorId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un profesor</option>
                        {profesores?.map(profesor => (
                          <option key={profesor.id} value={profesor.id}>
                            {profesor.nombre} - {profesor.departamento}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Aula</Form.Label>
                      <Form.Control 
                        type="text"
                        name="aula"
                        value={formData.aula}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Día</Form.Label>
                      <Form.Select 
                        name="dia"
                        value={formData.dia}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un día</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Hora de inicio</Form.Label>
                          <Form.Control 
                            type="time"
                            name="horaInicio"
                            value={formData.horaInicio}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Hora de fin</Form.Label>
                          <Form.Control 
                            type="time"
                            name="horaFin"
                            value={formData.horaFin}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                      </Button>
                      
                      {editingId && (
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            resetForm();
                            setEditingId(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card>
              <Card.Header>Horarios Existentes</Card.Header>
              <Card.Body>
                {horariosLoading ? (
                  <p className="text-center">Cargando horarios...</p>
                ) : !horarios || horarios.length === 0 ? (
                  <Alert variant="info">
                    No hay horarios registrados. Crea el primero usando el formulario.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Materia</th>
                          <th>Grupo</th>
                          <th>Día / Hora</th>
                          <th>Aula</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {horarios.map(horario => (
                          <tr key={horario.id}>
                            <td>{getNombreMateria(horario.materiaId)}</td>
                            <td>{getNombreGrupo(horario.grupoId)}</td>
                            <td>
                              {horario.dia} <br />
                              {horario.horaInicio} - {horario.horaFin}
                            </td>
                            <td>{horario.aula}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => loadForEdit(horario)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => confirmDelete(horario.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este horario?
          Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
};

export default AsignacionHorarios;