import { Grupo } from './grupo.types';

export interface Alumno {
  ID_Alumno: number;
  Nombre: string;
  Correo: string;
  Grupo: Grupo;
}

export interface CreateAlumnoDto {
  Nombre: string;
  Correo: string;
  Contraseña: string;
  Grupo_ID: number;
}

export interface UpdateAlumnoDto {
  Nombre?: string;
  Correo?: string;
  Contraseña?: string;
  Grupo_ID?: number;
}