import { Materia } from './materia.types';

export interface Salon {
  ID_Salon: number;
  Nombre: string;
  materias?: Materia[];
}

export interface CreateSalonDto {
  Nombre: string;
}

export interface UpdateSalonDto {
  Nombre?: string;
}