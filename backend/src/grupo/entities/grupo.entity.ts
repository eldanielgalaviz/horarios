import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity()
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  carrera: string;

  @Column()
  semestre: number;

  @OneToMany(() => Estudiante, estudiante => estudiante.grupo)
  estudiantes: Estudiante[];

  @OneToMany(() => Horario, horario => horario.grupo)
  horarios: Horario[];

  @Column({ nullable: true })
  jefeGrupoId: number;

  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'jefeGrupoId' })
  jefeGrupo: Estudiante;
}