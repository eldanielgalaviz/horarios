export enum UserRole {
    ADMIN = 'admin',
    ALUMNO = 'alumno',
    MAESTRO = 'maestro',
    CHECADOR = 'checador'
  }
  
  export interface User {
    id: number;
    nombre: string;
    correo: string;
    userType: UserRole;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  }
  
  export interface LoginCredentials {
    correo: string;
    contraseña: string;
    userType: UserRole;
  }
  
  export interface LoginResponse {
    access_token: string;
    user: User;
  }