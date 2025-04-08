import axiosInstance from './axios.ts';
import { LoginCredentials, LoginResponse } from '../types/auth.types.tsx';

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
