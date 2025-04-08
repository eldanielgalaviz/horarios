// pages/Home.js - Página de inicio
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1 className="mb-4">Sistema de Gestión Escolar</h1>
      <p className="lead mb-4">Bienvenido al sistema de gestión de horarios y asistencia escolar.</p>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card as={Link} to="/students" className="h-100 text-decoration-none">
            <Card.Body>
              <Card.Title>Estudiantes</Card.Title>
              <Card.Text>Gestiona la información de los estudiantes.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card as={Link} to="/teachers" className="h-100 text-decoration-none">
            <Card.Body>
              <Card.Title>Profesores</Card.Title>
              <Card.Text>Administra el personal docente.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card as={Link} to="/classes" className="h-100 text-decoration-none">
            <Card.Body>
              <Card.Title>Clases</Card.Title>
              <Card.Text>Gestiona las clases y sus asignaciones.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-4">
          <Card as={Link} to="/schedules" className="h-100 text-decoration-none">
            <Card.Body>
              <Card.Title>Horarios</Card.Title>
              <Card.Text>Visualiza y modifica los horarios de clases.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card as={Link} to="/attendance" className="h-100 text-decoration-none">
            <Card.Body>
              <Card.Title>Asistencia</Card.Title>
              <Card.Text>Registra y consulta la asistencia.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;