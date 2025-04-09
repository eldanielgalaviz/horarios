import axiosInstance from './axios';
import { LoginCredentials, LoginResponse } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  
  logout: (): void => {
    // Frontend-only logout, just clearing the stored token
    localStorage.removeItem('auth');
  },
};