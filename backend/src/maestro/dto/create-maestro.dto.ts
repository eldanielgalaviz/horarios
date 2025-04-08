import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateMaestroDto {
  @IsNotEmpty()
  @IsString()
  Nombre: string;

  @IsNotEmpty()
  @IsEmail()
  Correo: string;

  @IsNotEmpty()
  @IsString()
  Contraseña: string;
}
