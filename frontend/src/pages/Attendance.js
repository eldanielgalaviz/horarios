// pages/Attendance.js - Página de gestión de asistencia
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import API from '../services/api';

function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAttendance, setNewAttendance] = useState({
    scheduleId: '',
    attended: true
  });
  const [message, setMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de datos de asistencia...');
      
      const [attendanceResponse, schedulesResponse] = await Promise.all([
        API.getAllAttendance(),
        API.getAllSchedules()
      ]);
      
      console.log('Registros de asistencia recibidos:', attendanceResponse.data);
      console.log('Horarios recibidos:', schedulesResponse.data);
      
      setAttendanceRecords(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []);
      setSchedules(Array.isArray(schedulesResponse.data) ? schedulesResponse.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
      setAttendanceRecords([]);
      setSchedules([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (editingAttendance) {
      // Si estamos editando una asistencia existente
      if (type === 'checkbox') {
        setEditingAttendance({ ...editingAttendance, [name]: checked });
      } else {
        setEditingAttendance({ ...editingAttendance, [name]: value });
      }
    } else {
      // Si estamos creando una nueva asistencia
      if (type === 'checkbox') {
        setNewAttendance({ ...newAttendance, [name]: checked });
      } else {
        setNewAttendance({ ...newAttendance, [name]: value });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Enviando datos de nueva asistencia:', newAttendance);
      const attendanceToSave = {
        ...newAttendance,
        scheduleId: parseInt(newAttendance.scheduleId)
      };
      
      await API.markAttendance(attendanceToSave);
      setNewAttendance({
        scheduleId: '',
        attended: true
      });
      setMessage({ type: 'success', text: 'Asistencia registrada con éxito' });
      fetchData();
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
      setMessage({ 
        type: 'danger', 
        text: `Error al registrar asistencia: ${err.message || 'Error desconocido'}`
      });
    }
  };

  const handleEdit = (attendance) => {
    console.log('Editando asistencia:', attendance);
    setEditingAttendance({
      ...attendance,
      scheduleId: attendance.scheduleId.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log('Actualizando asistencia:', editingAttendance);
      const attendanceToUpdate = {
        ...editingAttendance,
        scheduleId: parseInt(editingAttendance.scheduleId)
      };
      await API.updateAttendance(editingAttendance.id, attendanceToUpdate);
      setMessage({ type: 'success', text: 'Asistencia actualizada con éxito' });
      setShowEditModal(false);
      setEditingAttendance(null);
      fetchData();
    } catch (err) {
      console.error('Error al actualizar asistencia:', err);
      setMessage({ 
        type: 'danger', 
        text: `Error al actualizar asistencia: ${err.message || 'Error desconocido'}`
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
      try {
        console.log('Eliminando asistencia:', id);
        await API.deleteAttendance(id);
        setMessage({ type: 'success', text: 'Registro de asistencia eliminado con éxito' });
        fetchData();
      } catch (err) {
        console.error('Error al eliminar asistencia:', err);
        setMessage({ 
          type: 'danger', 
          text: `Error al eliminar asistencia: ${err.message || 'Error desconocido'}`
        });
      }
    }
  };

  const getScheduleDetails = (scheduleId) => {
    const schedule = Array.isArray(schedules) ? schedules.find(s => s.id === scheduleId) : null;
    if (!schedule) return `Horario ${scheduleId}`;
    
    return `${schedule.student?.name || 'Sin estudiante'} - ${schedule.class?.name || 'Sin clase'} (${schedule.day} ${schedule.startTime})`;
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Asistencia</h1>
      
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Row className="mb-4">
        <Col lg={5}>
          <Card>
            <Card.Header>Registrar Asistencia</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Horario</Form.Label>
                  <Form.Select
                    name="scheduleId"
                    value={newAttendance.scheduleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar horario</option>
                    {Array.isArray(schedules) && schedules.map(schedule => (
                      <option key={schedule.id} value={schedule.id}>
                        {`ID: ${schedule.id} - ${schedule.subject} (${schedule.day} ${schedule.startTime})`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="attended"
                    label="Asistió"
                    checked={newAttendance.attended}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">Registrar</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Header>Registro de Asistencias</Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando asistencias...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Clase</th>
                      <th>Día y Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(attendanceRecords) && attendanceRecords.length > 0 ? (
                      attendanceRecords.map(record => {
                        const schedule = schedules.find(s => s.id === record.scheduleId);
                        return (
                          <tr key={record.id}>
                            <td>{schedule?.student?.name || 'N/A'}</td>
                            <td>{schedule?.class?.name || 'N/A'}</td>
                            <td>{schedule ? `${schedule.day} ${schedule.startTime}` : 'N/A'}</td>
                            <td>
                              {record.attended ? 
                                <span className="text-success">Presente</span> : 
                                <span className="text-danger">Ausente</span>
                              }
                            </td>
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(record)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No hay registros de asistencia</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Registro de Asistencia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Horario</Form.Label>
              <Form.Select
                name="scheduleId"
                value={editingAttendance?.scheduleId || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar horario</option>
                {Array.isArray(schedules) && schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {getScheduleDetails(schedule.id)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="attended"
                label="Asistió"
                checked={editingAttendance?.attended || false}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar cambios
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Attendance;