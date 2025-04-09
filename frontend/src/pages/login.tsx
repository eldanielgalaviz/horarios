import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    correo: '',
    contraseña: '',
    userType: UserRole.ALUMNO
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>Sistema de Horarios</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={credentials.correo}
                    onChange={handleChange}
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contraseña"
                    value={credentials.contraseña}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Tipo de usuario</Form.Label>
                  <Form.Select 
                    name="userType"
                    value={credentials.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value={UserRole.ALUMNO}>Alumno</option>
                    <option value={UserRole.MAESTRO}>Maestro</option>
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.CHECADOR}>Checador</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center text-muted py-3">
              <small>© 2023 Sistema de Horarios Escolares</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;