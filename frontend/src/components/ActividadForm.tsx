// src/components/ActividadForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { format } from 'date-fns';

interface ActividadFormProps {
  horarioId: number;
  profesorNombre: string;
  materiaNombre: string;
  onSubmit: (data: { 
    horarioId: number; 
    fecha: string; 
    tema: string; 
    actividades: string; 
    tareas: string;
  }) => Promise<void>;
}

const ActividadForm: React.FC<ActividadFormProps> = ({ 
  horarioId, 
  profesorNombre, 
  materiaNombre, 
  onSubmit 
}) => {
  const [tema, setTema] = useState<string>('');
  const [actividades, setActividades] = useState<string>('');
  const [tareas, setTareas] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tema || !actividades) {
      setError('El tema y las actividades son obligatorios');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Fecha actual en formato ISO (YYYY-MM-DD)
      const fecha = format(new Date(), 'yyyy-MM-dd');
      
      await onSubmit({
        horarioId,
        fecha,
        tema,
        actividades,
        tareas
      });
      
      setSuccess(true);
      // Opcionalmente limpiar el formulario
      setTema('');
      setActividades('');
      setTareas('');
    } catch (err) {
      setError('Error al registrar la actividad. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3 bg-light">
      <h4>Registrar Actividad de Clase</h4>
      <p className="mb-3">
        <strong>Profesor:</strong> {profesorNombre} | <strong>Materia:</strong> {materiaNombre}
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Actividad registrada correctamente.</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tema de la clase *</Form.Label>
          <Form.Control
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ingrese el tema visto en clase"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Actividades realizadas *</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={actividades}
            onChange={(e) => setActividades(e.target.value)}
            placeholder="Describa las actividades realizadas en clase"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Tareas asignadas</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={tareas}
            onChange={(e) => setTareas(e.target.value)}
            placeholder="Ingrese las tareas asignadas (opcional)"
          />
        </Form.Group>
        
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar Actividad'}
        </Button>
      </Form>
    </div>
  );
};

export default ActividadForm;