export interface Checador {
  ID: number;
  Correo: string;
}

export interface CreateChecadorDto {
  Correo: string;
  Contraseña: string;
}

export interface UpdateChecadorDto {
  Correo?: string;
  Contraseña?: string;
}