import { IsNotEmpty, IsNumber, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAsistenciaDto {
  @IsNotEmpty()
  @IsNumber()
  Horario_ID: number;

  @IsNotEmpty()
  @IsString()
  fecha: string;
  
  @IsOptional()
  @IsString()
  observaciones?: string;
}