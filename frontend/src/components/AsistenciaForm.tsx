// src/components/AsistenciaForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { format } from 'date-fns';

interface AsistenciaFormProps {
  horarioId: number;
  profesorNombre: string;
  materiaNombre: string;
  onSubmit: (data: { horarioId: number; fecha: string; presente: boolean; observaciones: string }) => Promise<void>;
}

const AsistenciaForm: React.FC<AsistenciaFormProps> = ({ 
  horarioId, 
  profesorNombre, 
  materiaNombre, 
  onSubmit 
}) => {
  const [presente, setPresente] = useState<boolean>(true);
  const [observaciones, setObservaciones] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Fecha actual en formato ISO (YYYY-MM-DD)
      const fecha = format(new Date(), 'yyyy-MM-dd');
      
      await onSubmit({
        horarioId,
        fecha,
        presente,
        observaciones
      });
      
      setSuccess(true);
      setObservaciones('');
    } catch (err) {
      setError('Error al registrar la asistencia. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3 bg-light">
      <h4>Registrar Asistencia</h4>
      <p className="mb-3">
        <strong>Profesor:</strong> {profesorNombre} | <strong>Materia:</strong> {materiaNombre}
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Asistencia registrada correctamente.</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Estado</Form.Label>
          <div>
            <Form.Check
              inline
              type="radio"
              label="Presente"
              name="asistencia"
              id="presente"
              checked={presente}
              onChange={() => setPresente(true)}
            />
            <Form.Check
              inline
              type="radio"
              label="Ausente"
              name="asistencia"
              id="ausente"
              checked={!presente}
              onChange={() => setPresente(false)}
            />
          </div>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ingrese observaciones (opcional)"
          />
        </Form.Group>
        
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar Asistencia'}
        </Button>
      </Form>
    </div>
  );
};

export default AsistenciaForm;