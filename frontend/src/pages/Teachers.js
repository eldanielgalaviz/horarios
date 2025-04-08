// pages/Teachers.js - Página de gestión de profesores
import React, { useState, useEffect } from 'react';
import { Table, Card, Alert, Button, Modal, Form } from 'react-bootstrap';
import API from '../services/api';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', phone: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await API.getAllTeachers();
      setTeachers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar profesores');
      setLoading(false);
      console.error(err);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await API.updateTeacher(editingTeacher.id, editingTeacher);
      setMessage({ type: 'success', text: 'Profesor actualizado con éxito' });
      setShowEditModal(false);
      setEditingTeacher(null);
      // Actualizar el profesor en la lista local
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => 
          teacher.id === editingTeacher.id ? response.data : teacher
        )
      );
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al actualizar profesor' });
      console.error('Error al actualizar profesor:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este profesor?')) {
      try {
        await API.deleteTeacher(id);
        setMessage({ type: 'success', text: 'Profesor eliminado con éxito' });
        // Eliminar el profesor de la lista local
        setTeachers(prevTeachers => prevTeachers.filter(teacher => teacher.id !== id));
      } catch (err) {
        setMessage({ type: 'danger', text: 'Error al eliminar profesor' });
        console.error('Error al eliminar profesor:', err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTeacher) {
      setEditingTeacher(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewTeacher(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddTeacher = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.createTeacher(newTeacher);
      setMessage({ type: 'success', text: 'Profesor creado con éxito' });
      setShowAddModal(false);
      setNewTeacher({ name: '', email: '', phone: '' });
      fetchTeachers();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al crear profesor' });
      console.error('Error al crear profesor:', err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Lista de Profesores</h1>
        <Button variant="primary" onClick={handleAddTeacher}>
          Agregar Profesor
        </Button>
      </div>
      
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Header>Profesores Registrados</Card.Header>
        <Card.Body>
          {loading ? (
            <p>Cargando profesores...</p>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td>{teacher.id}</td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(teacher)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No hay profesores registrados</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar profesores */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Profesor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newTeacher.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newTeacher.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={newTeacher.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Profesor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editingTeacher?.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editingTeacher?.email || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={editingTeacher?.phone || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Teachers;