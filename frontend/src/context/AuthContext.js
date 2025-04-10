import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth.service';
import { getAuth, setAuth } from '../utils/localStorage';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const auth = getAuth();
    if (auth && auth.token) {
      // Verify token expiration
      try {
        const decoded = jwt_decode(auth.token);
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
    setIsLoading(false);
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
      setAuth(newAuthState);
      
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
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    navigate('/login');
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'alumno':
        navigate('/alumno/dashboard');
        break;
      case 'maestro':
        navigate('/maestro/dashboard');
        break;
      case 'checador':
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