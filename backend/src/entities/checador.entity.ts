import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Checador {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  Correo: string;

  @Column()
  Contraseña: string;
}
