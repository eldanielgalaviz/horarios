import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Horario } from '../../horario/entities/horario.entity';

@Entity()
export class AsistenciaProfesor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Horario, horario => horario.asistencias)
  horario: Horario;

  @Column()
  horarioId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column()
  presente: boolean;

  @Column()
  registradoPor: number; // ID del usuario que registró (jefe grupo o checador)

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @CreateDateColumn()
  fechaRegistro: Date;
}