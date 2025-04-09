// src/pages/Login.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(credentials);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
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
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center text-muted py-3">
              <small>© 2025 Sistema de Horarios Escolares</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;