import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Crear una instancia de axios con configuración para incluir cookies
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para que las cookies de sesión se envíen en cada petición
});

// Interceptor para agregar el token a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si recibimos un 401 (No autorizado), podemos redirigir al login o refrescar el token
      localStorage.removeItem('token');
      // window.location = '/login'; // Descomenta esta línea si quieres redirigir automáticamente
    }
    return Promise.reject(error);
  }
);

const API = {
  // Autenticación
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  getCurrentUser: () => axiosInstance.get('/auth/profile'),
  // Estudiantes
  getAllStudents: () => axiosInstance.get('/students'),
  getStudent: (id) => axiosInstance.get(`/students/${id}`),
  createStudent: (student) => axiosInstance.post('/students', student),
  updateStudent: (id, student) => axiosInstance.put(`/students/${id}`, student),
  deleteStudent: (id) => axiosInstance.delete(`/students/${id}`),

  // Profesores
  getAllTeachers: () => axiosInstance.get('/teachers'),
  getTeacher: (id) => axiosInstance.get(`/teachers/${id}`),
  createTeacher: (teacher) => axiosInstance.post('/teachers', teacher),
  updateTeacher: (id, teacher) => axiosInstance.put(`/teachers/${id}`, teacher),
  deleteTeacher: (id) => axiosInstance.delete(`/teachers/${id}`),

  // Clases
  getAllClasses: () => axiosInstance.get('/classes'),
  getClass: (id) => axiosInstance.get(`/classes/${id}`),
  createClass: (classData) => axiosInstance.post('/classes', classData),
  updateClass: (id, classData) => axiosInstance.put(`/classes/${id}`, classData),
  deleteClass: (id) => axiosInstance.delete(`/classes/${id}`),

  // Horarios
  getAllSchedules: () => axiosInstance.get('/schedule'),
  getSchedule: (id) => axiosInstance.get(`/schedule/${id}`),
  createSchedule: (schedule) => axiosInstance.post('/schedule', schedule),
  updateSchedule: (id, schedule) => axiosInstance.put(`/schedule/${id}`, schedule),
  deleteSchedule: (id) => axiosInstance.delete(`/schedule/${id}`),

  // Asistencia
  getAllAttendance: () => axiosInstance.get('/attendance'),
  getAttendance: (id) => axiosInstance.get(`/attendance/${id}`),
  markAttendance: (attendance) => axiosInstance.post('/attendance', attendance),
  updateAttendance: (id, attendance) => axiosInstance.put(`/attendance/${id}`, attendance),
  deleteAttendance: (id) => axiosInstance.delete(`/attendance/${id}`),

  // Endpoint de verificación API
  checkApi: () => axiosInstance.get('/api/datos'),
};

export default API;