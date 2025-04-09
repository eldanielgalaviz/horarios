// src/actividad/entities/actividad-clase.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Horario } from '../../horario/entities/horario.entity';

@Entity()
export class ActividadClase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Horario, horario => horario.actividades)
  horario: Horario;

  @Column()
  horarioId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column()
  tema: string;

  @Column({ type: 'text' })
  actividades: string;

  @Column({ type: 'text', nullable: true })
  tareas: string;

  @Column()
  registradoPor: number; // ID del estudiante jefe de grupo

  @CreateDateColumn()
  fechaRegistro: Date;
}