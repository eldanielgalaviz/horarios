export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'teacher' | 'student';
  phone?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  role: string;
} 