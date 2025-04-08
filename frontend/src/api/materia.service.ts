import axiosInstance from './axios.ts';
import { Materia, CreateMateriaDto, UpdateMateriaDto } from '../types/materia.types.ts';

export const materiaService = {
  // Obtener todas las materias
  getAll: async (): Promise<Materia[]> => {
    const response = await axiosInstance.get('/materias');
    return response.data;
  },

  // Obtener una materia por ID
  getById: async (id: number): Promise<Materia> => {
    const response = await axiosInstance.get(`/materias/${id}`);
    return response.data;
  },

  // Obtener materias por maestro
  getByMaestro: async (maestroId: number): Promise<Materia[]> => {
    const response = await axiosInstance.get(`/materias/maestro/${maestroId}`);
    return response.data;
  },

  // Crear una nueva materia
  create: async (materia: CreateMateriaDto): Promise<Materia> => {
    const response = await axiosInstance.post('/materias', materia);
    return response.data;
  },

  // Actualizar una materia existente
  update: async (id: number, materia: UpdateMateriaDto): Promise<Materia> => {
    const response = await axiosInstance.put(`/materias/${id}`, materia);
    return response.data;
  },

  // Eliminar una materia
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/materias/${id}`);
  }
};