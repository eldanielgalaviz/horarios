import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Materia } from '../../materia/entities/materia.entity';
import { Profesor } from '../../profesor/entities/profesor.entity';
import { AsistenciaProfesor } from '../../asistencia/entities/asistencia-profesor.entity';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Materia, materia => materia.horarios)
  materia: Materia;

  @Column()
  materiaId: number;

  @ManyToOne(() => Grupo, grupo => grupo.horarios)
  grupo: Grupo;

  @Column()
  grupoId: number;

  @ManyToOne(() => Profesor, profesor => profesor.horarios)
  profesor: Profesor;

  @Column()
  profesorId: number;

  @Column()
  aula: string;

  @Column({
    type: 'enum',
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  })
  dia: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @OneToMany(() => AsistenciaProfesor, asistencia => asistencia.horario)
  asistencias: AsistenciaProfesor[];
}