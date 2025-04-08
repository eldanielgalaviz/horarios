import axiosInstance from './axios.ts';
import { Maestro, CreateMaestroDto, UpdateMaestroDto } from '../types/maestro.types.ts';

export const maestroService = {
  // Obtener todos los maestros
  getAll: async (): Promise<Maestro[]> => {
    const response = await axiosInstance.get('/maestros');
    return response.data;
  },

  // Obtener un maestro por ID
  getById: async (id: number): Promise<Maestro> => {
    const response = await axiosInstance.get(`/maestros/${id}`);
    return response.data;
  },

  // Obtener el perfil del maestro actual
  getProfile: async (): Promise<Maestro> => {
    const response = await axiosInstance.get('/maestros/me/profile');
    return response.data;
  },

  // Obtener las materias del maestro actual
  getMaterias: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/maestros/me/materias');
    return response.data;
  },

  // Obtener los horarios del maestro actual
  getHorarios: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/maestros/me/horarios');
    return response.data;
  },

  // Obtener las asistencias de los cursos del maestro actual
  getAsistencias: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/maestros/me/asistencias');
    return response.data;
  },

  // Crear un nuevo maestro
  create: async (maestro: CreateMaestroDto): Promise<Maestro> => {
    const response = await axiosInstance.post('/maestros', maestro);
    return response.data;
  },

  // Actualizar un maestro existente
  update: async (id: number, maestro: UpdateMaestroDto): Promise<Maestro> => {
    const response = await axiosInstance.put(`/maestros/${id}`, maestro);
    return response.data;
  },

  // Eliminar un maestro
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/maestros/${id}`);
  }
};