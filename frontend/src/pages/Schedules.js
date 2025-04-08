import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import API from '../services/api';

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    studentId: '',
    classId: '',
    day: '',
    startTime: '',
    endTime: ''
  });
  const [message, setMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      setError('Por favor, inicia sesión nuevamente');
      window.location.href = '/login';
      return;
    }
    fetchData();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.getAllStudents();
      setStudents(response.data);
      setLoading(false);
      return response;
    } catch (err) {
      setError('Error al cargar estudiantes');
      setLoading(false);
      console.error(err);
      throw err;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de datos...');
      console.log('Token actual:', localStorage.getItem('token'));
      
      // Obtener estudiantes
      console.log('Obteniendo estudiantes...');
      const studentsResponse = await fetchStudents();
      console.log('Respuesta de estudiantes:', studentsResponse);
      
      // Obtener clases
      console.log('Obteniendo clases...');
      const classesResponse = await API.getAllClasses();
      console.log('Respuesta de clases:', classesResponse);
      
      // Obtener horarios
      console.log('Obteniendo horarios...');
      const schedulesResponse = await API.getAllSchedules();
      console.log('Respuesta de horarios:', schedulesResponse);
      
      // Verificar y establecer los datos
      if (classesResponse.data?.data) {
        setClasses(classesResponse.data.data);
        console.log('Clases establecidas:', classesResponse.data.data);
      } else {
        console.warn('No se recibieron datos de clases válidos');
        setClasses([]);
      }

      if (schedulesResponse.data?.data) {
        setSchedules(schedulesResponse.data.data);
        console.log('Horarios establecidos:', schedulesResponse.data.data);
      } else {
        console.warn('No se recibieron datos de horarios válidos');
        setSchedules([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (err.response?.status === 401) {
        console.error('Error de autenticación detectado');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
      setSchedules([]);
      setStudents([]);
      setClasses([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingSchedule) {
      setEditingSchedule({ ...editingSchedule, [name]: value });
    } else {
      setNewSchedule({ ...newSchedule, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Enviando datos de nuevo horario:', newSchedule);
      const scheduleToSave = {
        ...newSchedule,
        studentId: parseInt(newSchedule.studentId),
        classId: parseInt(newSchedule.classId)
      };
      
      const response = await API.createSchedule(scheduleToSave);
      console.log('Respuesta al crear horario:', response);
      
      // Actualizamos la lista de horarios con el nuevo horario
      const updatedSchedulesResponse = await API.getAllSchedules();
      setSchedules(Array.isArray(updatedSchedulesResponse.data.data) ? updatedSchedulesResponse.data.data : []);
      
      setNewSchedule({
        studentId: '',
        classId: '',
        day: '',
        startTime: '',
        endTime: ''
      });
      setMessage({ type: 'success', text: 'Horario creado con éxito' });
    } catch (err) {
      console.error('Error al crear horario:', err);
      setMessage({ 
        type: 'danger', 
        text: `Error al crear horario: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    console.log('Editando horario:', schedule);
    setEditingSchedule({
      ...schedule,
      studentId: schedule.student?.id?.toString() || '',
      classId: schedule.class?.id?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Actualizando horario:', editingSchedule);
      const scheduleToUpdate = {
        ...editingSchedule,
        studentId: parseInt(editingSchedule.studentId),
        classId: parseInt(editingSchedule.classId)
      };
      
      const response = await API.updateSchedule(editingSchedule.id, scheduleToUpdate);
      console.log('Respuesta al actualizar horario:', response);
      
      // Actualizamos la lista de horarios
      const updatedSchedulesResponse = await API.getAllSchedules();
      setSchedules(Array.isArray(updatedSchedulesResponse.data.data) ? updatedSchedulesResponse.data.data : []);
      
      setShowEditModal(false);
      setEditingSchedule(null);
      setMessage({ type: 'success', text: 'Horario actualizado con éxito' });
    } catch (err) {
      console.error('Error al actualizar horario:', err);
      setMessage({ 
        type: 'danger', 
        text: `Error al actualizar horario: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        setLoading(true);
        console.log('Eliminando horario:', id);
        await API.deleteSchedule(id);
        
        // Actualizamos la lista de horarios
        const updatedSchedulesResponse = await API.getAllSchedules();
        setSchedules(Array.isArray(updatedSchedulesResponse.data.data) ? updatedSchedulesResponse.data.data : []);
        
        setMessage({ type: 'success', text: 'Horario eliminado con éxito' });
      } catch (err) {
        console.error('Error al eliminar horario:', err);
        setMessage({ 
          type: 'danger', 
          text: `Error al eliminar horario: ${err.message || 'Error desconocido'}`
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Horarios</h1>
      
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          {error.includes('sesión') && (
            <Button
              variant="link"
              className="p-0 ms-2"
              onClick={() => window.location.href = '/login'}
            >
              Ir al login
            </Button>
          )}
        </Alert>
      )}

      <Row className="mb-4">
        <Col lg={5}>
          <Card>
            <Card.Header>Registrar Nuevo Horario</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Estudiante</Form.Label>
                  <Form.Select
                    name="studentId"
                    value={newSchedule.studentId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar estudiante</option>
                    {Array.isArray(students) && students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Clase</Form.Label>
                  <Form.Select
                    name="classId"
                    value={newSchedule.classId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar clase</option>
                    {Array.isArray(classes) && classes.map(classItem => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.teacher?.name || 'Sin profesor'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Día</Form.Label>
                  <Form.Select
                    name="day"
                    value={newSchedule.day}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar día</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Hora de inicio</Form.Label>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={newSchedule.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Hora de fin</Form.Label>
                      <Form.Control
                        type="time"
                        name="endTime"
                        value={newSchedule.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrar'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={7}>
          <Card>
            <Card.Header>Lista de Horarios</Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando horarios...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Clase</th>
                      <th>Profesor</th>
                      <th>Día</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(schedules) && schedules.length > 0 ? (
                      schedules.map(schedule => (
                        <tr key={schedule.id}>
                          <td>{schedule.student?.name || 'N/A'}</td>
                          <td>{schedule.class?.name || 'N/A'}</td>
                          <td>{schedule.class?.teacher?.name || 'N/A'}</td>
                          <td>{schedule.day}</td>
                          <td>{schedule.startTime}</td>
                          <td>{schedule.endTime}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(schedule)}
                              disabled={loading}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(schedule.id)}
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No hay horarios registrados</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showEditModal} onHide={() => !loading && setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Horario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Estudiante</Form.Label>
              <Form.Select
                name="studentId"
                value={editingSchedule?.studentId || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Seleccionar estudiante</option>
                {Array.isArray(students) && students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Clase</Form.Label>
              <Form.Select
                name="classId"
                value={editingSchedule?.classId || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Seleccionar clase</option>
                {Array.isArray(classes) && classes.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.teacher?.name || 'Sin profesor'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Día</Form.Label>
              <Form.Select
                name="day"
                value={editingSchedule?.day || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Seleccionar día</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora de inicio</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={editingSchedule?.startTime || ''}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora de fin</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={editingSchedule?.endTime || ''}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Schedules;