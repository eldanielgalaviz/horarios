import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, LoginCredentials, User, UserRole } from '../types/auth.types.ts';
import { authService } from '../api/auth.service.ts';
import { getAuth, setAuth } from '../utils/localStorage.ts';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const auth = getAuth();
    if (auth && auth.token) {
      // Verify token expiration
      try {
       // Asumiendo que tienes un token en auth.token
       const decoded = jwtDecode<any>(auth.token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp > currentTime) {
          setAuthState(auth);
        } else {
          // Token expired
          localStorage.removeItem('auth');
        }
      } catch (e) {
        // Invalid token
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user: response.user,
        token: response.access_token,
      };
      
      setAuthState(newAuthState);
      setAuth(newAuthState);
      
      // Redirect based on user role
      redirectBasedOnRole(response.user.userType);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState(initialAuthState);
    navigate('/login');
  };

  const redirectBasedOnRole = (role: UserRole) => {
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