import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Materia } from '../../materia/entities/materia.entity';
import { Horario } from '../../horario/entities/horario.entity';

@Entity()
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  numeroEmpleado: string;

  @Column({ nullable: true })
  departamento: string;

  @OneToMany(() => Materia, materia => materia.profesor)
  materias: Materia[];

  @OneToMany(() => Horario, horario => horario.profesor)
  horarios: Horario[];

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;
}