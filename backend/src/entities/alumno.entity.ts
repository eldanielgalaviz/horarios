import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Grupo } from './grupo.entity';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  ID_Alumno: number;

  @Column()
  Nombre: string;

  @Column()
  Correo: string;

  @Column()
  Contraseña: string;

  @ManyToOne(() => Grupo, grupo => grupo.alumnos)
  @JoinColumn({ name: 'Grupo_ID' })
  Grupo: Grupo;
}