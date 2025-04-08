import { Alumno } from './alumno.types';

export interface Grupo {
  ID_Grupo: number;
  Nombre: string;
  alumnos?: Alumno[];
}

export interface CreateGrupoDto {
  Nombre: string;
}

export interface UpdateGrupoDto {
  Nombre?: string;
}