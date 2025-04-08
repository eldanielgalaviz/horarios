import axiosInstance from './axios.ts';
import { Horario, CreateHorarioDto, UpdateHorarioDto } from '../types/horario.types.ts';

export const horarioService = {
  // Obtener todos los horarios
  getAll: async (): Promise<Horario[]> => {
    const response = await axiosInstance.get('/horarios');
    return response.data;
  },

  // Obtener un horario por ID
  getById: async (id: number): Promise<Horario> => {
    const response = await axiosInstance.get(`/horarios/${id}`);
    return response.data;
  },

  // Obtener horarios por grupo
  getByGrupo: async (grupoId: number): Promise<Horario[]> => {
    const response = await axiosInstance.get(`/horarios/grupo/${grupoId}`);
    return response.data;
  },

  // Crear un nuevo horario
  create: async (horario: CreateHorarioDto): Promise<Horario> => {
    const response = await axiosInstance.post('/horarios', horario);
    return response.data;
  },

  // Actualizar un horario existente
  update: async (id: number, horario: UpdateHorarioDto): Promise<Horario> => {
    const response = await axiosInstance.put(`/horarios/${id}`, horario);
    return response.data;
  },

  // Eliminar un horario
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/horarios/${id}`);
  }
};