import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSalonDto {
  @IsNotEmpty()
  @IsString()
  Nombre: string;
}
