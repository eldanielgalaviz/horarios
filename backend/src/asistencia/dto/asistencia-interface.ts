import { Horario } from "../../horario/entities/horario.entity";

export interface Asistencia {
  ID: number;
  Horario: Horario;
  Asistio: boolean;
  Fecha: Date;
  FechaRegistro: Date;
}