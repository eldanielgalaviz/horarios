import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Materia } from './materia.entity';

@Entity()
export class Maestro {
  @PrimaryGeneratedColumn()
  ID_Maestro: number;

  @Column()
  Nombre: string;

  @Column()
  Correo: string;

  @Column()
  Contraseña: string;

  @OneToMany(() => Materia, materia => materia.Maestro)
  materias: Materia[];
}