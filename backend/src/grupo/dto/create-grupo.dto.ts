import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGrupoDto {
  @IsNotEmpty()
  @IsString()
  Nombre: string;
}