import { Maestro } from './maestro.types';
import { Salon } from './salon.types';

export interface Materia {
  ID_Materia: number;
  Nombre: string;
  Maestro: Maestro;
  Salon: Salon;
}

export interface CreateMateriaDto {
  Nombre: string;
  Maestro_ID: number;
  Salon_ID: number;
}

export interface UpdateMateriaDto {
  Nombre?: string;
  Maestro_ID?: number;
  Salon_ID?: number;
}