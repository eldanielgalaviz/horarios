import { Grupo } from './grupo.types';
import { Materia } from './materia.types';
import { Salon } from './salon.types';

export interface Horario {
  ID: number;
  Grupo: Grupo;
  Materia: Materia;
  Salon: Salon;
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

export interface CreateHorarioDto {
  Grupo_ID: number;
  Materia_ID: number;
  Salon_ID: number;
  HoraInicio: string;
  HoraFin: string;
  Dias: string;
}

export interface UpdateHorarioDto {
  Grupo_ID?: number;
  Materia_ID?: number;
  Salon_ID?: number;
  HoraInicio?: string;
  HoraFin?: string;
  Dias?: string;
}