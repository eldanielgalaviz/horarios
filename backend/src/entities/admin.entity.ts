import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  Nombre: string;

  @Column({ unique: true })
  Correo: string;

  @Column()
  Contraseña: string;
}
