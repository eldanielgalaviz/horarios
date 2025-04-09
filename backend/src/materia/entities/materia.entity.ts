import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Profesor } from '../../profesor/entities/profesor.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity()
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  creditos: number;

  @ManyToOne(() => Profesor, profesor => profesor.materias)
  profesor: Profesor;

  @Column()
  profesorId: number;

  @OneToMany(() => Horario, horario => horario.materia)
  horarios: Horario[];
}