import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  matricula: string;

  @Column({ default: false })
  esJefeGrupo: boolean;

  @ManyToOne(() => Grupo, grupo => grupo.estudiantes)
  grupo: Grupo;

  @Column()
  grupoId: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;
}