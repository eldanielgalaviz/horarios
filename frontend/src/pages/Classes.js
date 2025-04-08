import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import API from '../services/api';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newClass, setNewClass] = useState({ name: '', teacher: { id: '' } });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargar clases y profesores en
      setLoading(true);
      // Cargar clases y profesores en paralelo
      const [classesResponse, teachersResponse] = await Promise.all([
        API.getAllClasses(),
        API.getAllTeachers()
      ]);
      
      setClasses(classesResponse.data);
      setTeachers(teachersResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos');
      setLoading(false);
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'teacherId') {
      setNewClass({ ...newClass, teacher: { id: parseInt(value) } });
    } else {
      setNewClass({ ...newClass, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.createClass(newClass);
      setNewClass({ name: '', teacher: { id: '' } });
      setMessage({ type: 'success', text: 'Clase creada con éxito' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al crear clase' });
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Gestión de Clases</h1>
      
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Row className="mb-4">
        <Col lg={5}>
          <Card>
            <Card.Header>Registrar Nueva Clase</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la clase</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newClass.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Profesor</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={newClass.teacher.id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar profesor</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit">Registrar</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Header>Lista de Clases</Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando clases...</p>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de la Clase</th>
                      <th>Profesor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length > 0 ? (
                      classes.map(classItem => (
                        <tr key={classItem.id}>
                          <td>{classItem.id}</td>
                          <td>{classItem.name}</td>
                          <td>{classItem.teacher ? classItem.teacher.name : 'No asignado'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No hay clases registradas</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Classes