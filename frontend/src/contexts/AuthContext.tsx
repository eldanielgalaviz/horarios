// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import jwt_decode from 'jwt-decode';

interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'estudiante' | 'profesor' | 'checador' | 'admin';
  esJefeGrupo?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Verificar token existente al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verificar que el token sea válido y no esté expirado
        const decoded: any = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Token válido, obtener información del usuario
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          getUserInfo(token);
        } else {
          // Token expirado
          localStorage.removeItem('token');
          setAuthState(initialAuthState);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setAuthState(initialAuthState);
      }
    }
    setLoading(false);
  }, []);

  // Obtener información del usuario actual
  const getUserInfo = async (token: string) => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      const userData = response.data;
      
      setAuthState({
        isAuthenticated: true,
        user: userData,
        token,
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('token');
      setAuthState(initialAuthState);
    }
  };

  // Login
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Establecer token en headers para futuras peticiones
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
      });
      
      // Redirigir basado en el rol del usuario
      redirectBasedOnRole(user.role, user.esJefeGrupo);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setAuthState(initialAuthState);
    navigate('/login');
  };

  // Redirigir según el rol del usuario
  const redirectBasedOnRole = (role: string, esJefeGrupo?: boolean) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'profesor':
        navigate('/profesor/horarios');
        break;
      case 'estudiante':
        // Si es jefe de grupo, redirigir a una página específica
        if (esJefeGrupo) {
          navigate('/jefe-grupo/dashboard');
        } else {
          navigate('/estudiante/horarios');
        }
        break;
      case 'checador':
        navigate('/checador/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};