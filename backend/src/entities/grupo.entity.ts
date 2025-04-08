import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Alumno } from './alumno.entity';

@Entity()
export class Grupo {
  @PrimaryGeneratedColumn()
  ID_Grupo: number;

  @Column()
  Nombre: string;

  @OneToMany(() => Alumno, alumno => alumno.Grupo)
  alumnos: Alumno[];
}