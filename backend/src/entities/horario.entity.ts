import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Grupo } from './grupo.entity';
import { Materia } from './materia.entity';
import { Salon } from './salon.entity';
import { Asistencia } from './asistencia.entity';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn()
  ID: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'Grupo_ID' })
  Grupo: Grupo;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'Materia_ID' })
  Materia: Materia;

  @ManyToOne(() => Salon)
  @JoinColumn({ name: 'Salon_ID' })
  Salon: Salon;

  @Column({ type: 'time' })
  HoraInicio: string;

  @Column({ type: 'time' })
  HoraFin: string;

  @Column({ type: 'date' })
  Dias: Date;

  @OneToMany(() => Asistencia, asistencia => asistencia.Horario)
  asistencias: Asistencia[];
}
