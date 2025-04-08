import axiosInstance from './axios.ts';
import { Asistencia, CreateAsistenciaDto, UpdateAsistenciaDto } from '../types/asistencia.types.ts';

export const asistenciaService = {
  // Obtener todas las asistencias
  getAll: async (): Promise<Asistencia[]> => {
    const response = await axiosInstance.get('/asistencias');
    return response.data;
  },

  // Obtener una asistencia por ID
  getById: async (id: number): Promise<Asistencia> => {
    const response = await axiosInstance.get(`/asistencias/${id}`);
    return response.data;
  },

  // Obtener asistencias por horario
  getByHorario: async (horarioId: number): Promise<Asistencia[]> => {
    const response = await axiosInstance.get(`/asistencias/horario/${horarioId}`);
    return response.data;
  },

  // Obtener asistencias por rango de fechas
  getByFechas: async (fechaInicio: string, fechaFin: string): Promise<Asistencia[]> => {
    const response = await axiosInstance.get(
      `/asistencias/fecha/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener asistencias por grupo y rango de fechas
  getByGrupoAndFechas: async (grupoId: number, fechaInicio: string, fechaFin: string): Promise<Asistencia[]> => {
    const response = await axiosInstance.get(
      `/asistencias/grupo/${grupoId}/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener asistencias por maestro y rango de fechas
  getByMaestroAndFechas: async (maestroId: number, fechaInicio: string, fechaFin: string): Promise<Asistencia[]> => {
    const response = await axiosInstance.get(
      `/asistencias/maestro/${maestroId}/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Crear una nueva asistencia
  create: async (asistencia: CreateAsistenciaDto): Promise<Asistencia> => {
    const response = await axiosInstance.post('/asistencias', asistencia);
    return response.data;
  },

  // Registrar asistencias en masa (múltiples alumnos)
  createBulk: async (data: {
    Horario_ID: number;
    Fecha: string;
    Registros: Array<{ alumnoId: number; presente: boolean }>;
  }): Promise<any> => {
    const response = await axiosInstance.post('/asistencias/bulk', data);
    return response.data;
  },

  // Actualizar una asistencia existente
  update: async (id: number, asistencia: UpdateAsistenciaDto): Promise<Asistencia> => {
    const response = await axiosInstance.put(`/asistencias/${id}`, asistencia);
    return response.data;
  },

  // Eliminar una asistencia
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/asistencias/${id}`);
  }
};