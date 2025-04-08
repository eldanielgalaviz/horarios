import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateChecadorDto {
  @IsNotEmpty()
  @IsEmail()
  Correo: string;

  @IsNotEmpty()
  @IsString()
  Contraseña: string;
}