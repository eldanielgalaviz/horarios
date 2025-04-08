import { Horario } from './horario.types';

export interface Asistencia {
  ID: number;
  Horario: Horario;
  Asistio: boolean;
  Fecha: string;
  FechaRegistro: string;
}

export interface CreateAsistenciaDto {
  Horario_ID: number;
  Asistio: boolean;
  Fecha: string;
}

export interface UpdateAsistenciaDto {
  Horario_ID?: number;
  Asistio?: boolean;
  Fecha?: string;
}

export interface AsistenciaRegistro {
  alumnoId: number;
  presente: boolean;
}

export interface BulkAsistenciaDto {
  Horario_ID: number;
  Fecha: string;
  Registros: AsistenciaRegistro[];
}