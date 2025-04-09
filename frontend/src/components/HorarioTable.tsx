
// src/components/HorarioTable.tsx
import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Horario {
  id: number;
  materia: {
    id: number;
    nombre: string;
    codigo: string;
  };
  profesor: {
    id: number;
    nombre: string;
  };
  grupo: {
    id: number;
    nombre: string;
  };
  aula: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface HorarioTableProps {
  horarios: Horario[];
  showGrupo?: boolean;
  showActions?: boolean;
  onSelectHorario?: (horario: Horario) => void;
}

const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const HorarioTable: React.FC<HorarioTableProps> = ({ 
  horarios, 
  showGrupo = false, 
  showActions = false,
  onSelectHorario
}) => {
  // Ordenar horarios por día y hora
  const horariosSorted = [...horarios].sort((a, b) => {
    const diaAIndex = diasOrden.indexOf(a.dia);
    const diaBIndex = diasOrden.indexOf(b.dia);
    
    if (diaAIndex !== diaBIndex) {
      return diaAIndex - diaBIndex;
    }
    
    return a.horaInicio.localeCompare(b.horaInicio);
  });

  const formatHora = (hora: string) => {
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Día</th>
          <th>Hora</th>
          <th>Materia</th>
          <th>Profesor</th>
          {showGrupo && <th>Grupo</th>}
          <th>Aula</th>
          {showActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {horariosSorted.map(horario => (
          <tr key={horario.id}>
            <td>
              <Badge 
                bg={getBadgeColor(horario.dia)}
                className="text-white"
              >
                {horario.dia}
              </Badge>
            </td>
            <td>{formatHora(horario.horaInicio)} - {formatHora(horario.horaFin)}</td>
            <td>{horario.materia.nombre}</td>
            <td>{horario.profesor.nombre}</td>
            {showGrupo && <td>{horario.grupo.nombre}</td>}
            <td>{horario.aula}</td>
            {showActions && (
              <td>
                <button 
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => onSelectHorario && onSelectHorario(horario)}
                >
                  Seleccionar
                </button>
              </td>
            )}
          </tr>
        ))}
        {horariosSorted.length === 0 && (
          <tr>
            <td colSpan={showGrupo ? 7 : 6} className="text-center">
              No hay horarios disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

// Función para asignar colores a los días
const getBadgeColor = (dia: string): string => {
  switch (dia) {
    case 'Lunes': return 'primary';
    case 'Martes': return 'success';
    case 'Miércoles': return 'danger';
    case 'Jueves': return 'warning';
    case 'Viernes': return 'info';
    case 'Sábado': return 'secondary';
    default: return 'dark';
  }
};

export default HorarioTable;