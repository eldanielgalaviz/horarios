import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMateriaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsNumber()
  creditos: number;

  @IsNotEmpty()
  @IsNumber()
  profesorId: number;
}