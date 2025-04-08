import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Materia } from './materia.entity';

@Entity()
export class Salon {
  @PrimaryGeneratedColumn()
  ID_Salon: number;

  @Column()
  Nombre: string;

  @OneToMany(() => Materia, materia => materia.Salon)
  materias: Materia[];
}