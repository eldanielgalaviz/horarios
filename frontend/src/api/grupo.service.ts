import axiosInstance from './axios.ts';
import { Grupo, CreateGrupoDto, UpdateGrupoDto } from '../types/grupo.types.ts';

export const grupoService = {
  // Obtener todos los grupos
  getAll: async (): Promise<Grupo[]> => {
    const response = await axiosInstance.get('/grupos');
    return response.data;
  },

  // Obtener un grupo por ID
  getById: async (id: number): Promise<Grupo> => {
    const response = await axiosInstance.get(`/grupos/${id}`);
    return response.data;
  },

  // Crear un nuevo grupo
  create: async (grupo: CreateGrupoDto): Promise<Grupo> => {
    const response = await axiosInstance.post('/grupos', grupo);
    return response.data;
  },

  // Actualizar un grupo existente
  update: async (id: number, grupo: UpdateGrupoDto): Promise<Grupo> => {
    const response = await axiosInstance.put(`/grupos/${id}`, grupo);
    return response.data;
  },

  // Eliminar un grupo
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/grupos/${id}`);
  }
};