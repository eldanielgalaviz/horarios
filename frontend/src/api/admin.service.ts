import axiosInstance from './axios.ts';
import { Admin, CreateAdminDto, UpdateAdminDto } from '../types/admin.types.ts';

export const adminService = {
  // Obtener todos los administradores
  getAll: async (): Promise<Admin[]> => {
    const response = await axiosInstance.get('/admins');
    return response.data;
  },

  // Obtener un administrador por ID
  getById: async (id: number): Promise<Admin> => {
    const response = await axiosInstance.get(`/admins/${id}`);
    return response.data;
  },

  // Crear un nuevo administrador
  create: async (admin: CreateAdminDto): Promise<Admin> => {
    const response = await axiosInstance.post('/admins', admin);
    return response.data;
  },

  // Actualizar un administrador existente
  update: async (id: number, admin: UpdateAdminDto): Promise<Admin> => {
    const response = await axiosInstance.put(`/admins/${id}`, admin);
    return response.data;
  },

  // Eliminar un administrador
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admins/${id}`);
  }
};