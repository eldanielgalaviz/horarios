import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAlumnoDto {
  @IsNotEmpty()
  @IsString()
  Nombre: string;

  @IsNotEmpty()
  @IsEmail()
  Correo: string;

  @IsNotEmpty()
  @IsString()
  Contraseña: string;

  @IsNotEmpty()
  @IsNumber()
  Grupo_ID: number;
}