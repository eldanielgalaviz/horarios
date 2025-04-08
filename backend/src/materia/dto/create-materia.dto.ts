import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMateriaDto {
  @IsNotEmpty()
  @IsString()
  Nombre: string;

  @IsNotEmpty()
  @IsNumber()
  Maestro_ID: number;

  @IsNotEmpty()
  @IsNumber()
  Salon_ID: number;
}