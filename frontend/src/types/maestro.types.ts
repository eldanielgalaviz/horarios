import { Materia } from './materia.types';

export interface Maestro {
  ID_Maestro: number;
  Nombre: string;
  Correo: string;
  materias?: Materia[];
}

export interface CreateMaestroDto {
  Nombre: string;
  Correo: string;
  Contraseña: string;
}

export interface UpdateMaestroDto {
  Nombre?: string;
  Correo?: string;
  Contraseña?: string;
}