import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importación de páginas
import Home from './pages/Home';
import Students from './pages/Students';
import Teachers from './pages/Teachers.js';
import Classes from './pages/Classes.js';
import Schedules from './pages/Schedules.js';
import Attendance from './pages/Attendance.js';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">Sistema de Gestión Escolar</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                <Nav.Link as={Link} to="/students">Estudiantes</Nav.Link>
                <Nav.Link as={Link} to="/teachers">Profesores</Nav.Link>
                <Nav.Link as={Link} to="/classes">Clases</Nav.Link>
                <Nav.Link as={Link} to="/schedules">Horarios</Nav.Link>
                <Nav.Link as={Link} to="/attendance">Asistencia</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;