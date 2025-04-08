// src/entities/asistencia.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Horario } from './horario.entity';

@Entity()
export class Asistencia {
  @PrimaryGeneratedColumn()
  ID: number;

  @ManyToOne(() => Horario, horario => horario.asistencias)
  @JoinColumn({ name: 'Horario_ID' })
  Horario: Horario;

  @Column({ type: 'boolean', default: false })
  Asistio: boolean;

  @Column({ type: 'date' })
  Fecha: Date;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  FechaRegistro: Date;
}