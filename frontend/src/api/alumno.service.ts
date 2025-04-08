import axiosInstance from './axios.ts';
import { Alumno, CreateAlumnoDto, UpdateAlumnoDto } from '../types/alumno.types.ts';

export const alumnoService = {
  // Obtener todos los alumnos
  getAll: async (): Promise<Alumno[]> => {
    const response = await axiosInstance.get('/alumnos');
    return response.data;
  },

  // Obtener un alumno por ID
  getById: async (id: number): Promise<Alumno> => {
    const response = await axiosInstance.get(`/alumnos/${id}`);
    return response.data;
  },

  // Obtener el perfil del alumno actual
  getProfile: async (): Promise<Alumno> => {
    const response = await axiosInstance.get('/alumnos/me/profile');
    return response.data;
  },

  // Obtener los horarios del alumno actual
  getHorarios: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/alumnos/me/horarios');
    return response.data;
  },

  // Obtener las asistencias del alumno actual
  getAsistencias: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/alumnos/me/asistencias');
    return response.data;
  },

  // Registrar asistencia para el alumno actual
  registerAsistencia: async (data: { Horario_ID: number, Fecha: string }): Promise<any> => {
    const response = await axiosInstance.post('/alumnos/me/asistencia', {
      ...data,
      Asistio: true
    });
    return response.data;
  },

  // Crear un nuevo alumno
  create: async (alumno: CreateAlumnoDto): Promise<Alumno> => {
    const response = await axiosInstance.post('/alumnos', alumno);
    return response.data;
  },

  // Actualizar un alumno existente
  update: async (id: number, alumno: UpdateAlumnoDto): Promise<Alumno> => {
    const response = await axiosInstance.put(`/alumnos/${id}`, alumno);
    return response.data;
  },

  // Eliminar un alumno
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/alumnos/${id}`);
  }
};