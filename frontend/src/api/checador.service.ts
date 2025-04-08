import axiosInstance from './axios.ts';
import { Checador, CreateChecadorDto, UpdateChecadorDto } from '../types/checador.types.ts';

export const checadorService = {
  // Obtener todos los checadores
  getAll: async (): Promise<Checador[]> => {
    const response = await axiosInstance.get('/checadores');
    return response.data;
  },

  // Obtener un checador por ID
  getById: async (id: number): Promise<Checador> => {
    const response = await axiosInstance.get(`/checadores/${id}`);
    return response.data;
  },

  // Obtener todos los horarios (para el checador)
  getAllHorarios: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/checadores/horarios/all');
    return response.data;
  },

  // Obtener todas las asistencias
  getAllAsistencias: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/checadores/asistencias/all');
    return response.data;
  },

  // Registrar asistencia (para los estudiantes)
  registerAsistencia: async (data: {
    Horario_ID: number;
    Fecha: string;
    Registros: Array<{ alumnoId: number; presente: boolean }>;
  }): Promise<any> => {
    const response = await axiosInstance.post('/checadores/asistencias/register', data);
    return response.data;
  },

  // Crear un nuevo checador
  create: async (checador: CreateChecadorDto): Promise<Checador> => {
    const response = await axiosInstance.post('/checadores', checador);
    return response.data;
  },

  // Actualizar un checador existente
  update: async (id: number, checador: UpdateChecadorDto): Promise<Checador> => {
    const response = await axiosInstance.put(`/checadores/${id}`, checador);
    return response.data;
  },

  // Eliminar un checador
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/checadores/${id}`);
  }
};