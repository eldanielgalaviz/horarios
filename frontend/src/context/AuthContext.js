import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth.service';
import { jwtDecode } from 'jwt-decode';

// Definir tipos directamente en este archivo
export const UserRole = {
  ADMIN: 'admin',
  ALUMNO: 'alumno',
  MAESTRO: 'maestro',
  CHECADOR: 'checador'
};

// Interfaces para el contexto
const initialAuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData && authData.token) {
          // Verify token expiration
          const decoded = jwtDecode(authData.token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp > currentTime) {
            setAuthState(authData);
          } else {
            // Token expired
            localStorage.removeItem('auth');
          }
        }
      } catch (e) {
        // Invalid token
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      const newAuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.access_token,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
      
      // Redirect based on user role
      redirectBasedOnRole(response.user.userType);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState(initialAuthState);
    localStorage.removeItem('auth');
    navigate('/login');
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case UserRole.ADMIN:
        navigate('/admin/dashboard');
        break;
      case UserRole.ALUMNO:
        navigate('/alumno/dashboard');
        break;
      case UserRole.MAESTRO:
        navigate('/maestro/dashboard');
        break;
      case UserRole.CHECADOR:
        navigate('/checador/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};