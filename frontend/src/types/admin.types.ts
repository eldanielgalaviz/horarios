export interface Admin {
    ID: number;
    Nombre: string;
    Correo: string;
  }
  
  export interface CreateAdminDto {
    Nombre: string;
    Correo: string;
    Contraseña: string;
  }
  
  export interface UpdateAdminDto {
    Nombre?: string;
    Correo?: string;
    Contraseña?: string;
  }