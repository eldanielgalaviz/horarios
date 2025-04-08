import axiosInstance from './axios.ts';
import { Salon, CreateSalonDto, UpdateSalonDto } from '../types/salon.types.ts';

export const salonService = {
  // Obtener todos los salones
  getAll: async (): Promise<Salon[]> => {
    const response = await axiosInstance.get('/salones');
    return response.data;
  },

  // Obtener un salón por ID
  getById: async (id: number): Promise<Salon> => {
    const response = await axiosInstance.get(`/salones/${id}`);
    return response.data;
  },

  // Crear un nuevo salón
  create: async (salon: CreateSalonDto): Promise<Salon> => {
    const response = await axiosInstance.post('/salones', salon);
    return response.data;
  },

  // Actualizar un salón existente
  update: async (id: number, salon: UpdateSalonDto): Promise<Salon> => {
    const response = await axiosInstance.put(`/salones/${id}`, salon);
    return response.data;
  },

  // Eliminar un salón
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/salones/${id}`);
  }
};