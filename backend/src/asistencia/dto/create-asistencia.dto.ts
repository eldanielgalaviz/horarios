// src/asistencia/dto/create-asistencia.dto.ts
import { IsNotEmpty, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAsistenciaDto {
  @IsNotEmpty()
  @IsNumber()
  Horario_ID: number;

  @IsNotEmpty()
  @IsBoolean()
  Asistio: boolean;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  Fecha: Date;
}