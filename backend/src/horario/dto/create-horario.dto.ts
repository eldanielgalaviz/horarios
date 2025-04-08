import { IsNotEmpty, IsString, IsNumber, IsDate, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHorarioDto {
  @IsNotEmpty()
  @IsNumber()
  Grupo_ID: number;

  @IsNotEmpty()
  @IsNumber()
  Materia_ID: number;

  @IsNotEmpty()
  @IsNumber()
  Salon_ID: number;

  @IsNotEmpty()
  @IsDateString()
  HoraInicio: string;

  @IsNotEmpty()
  @IsDateString()
  HoraFin: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  Dias: Date;
}
