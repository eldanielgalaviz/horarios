import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Class } from './class.entity';
import { Student } from '../entities/student.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  subject: string;

  @Column()
  day: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  // Actualizamos la relación para que sea nullable y sin referencia inversa
  @ManyToOne(() => Class, { nullable: true })
  class: Class;

  // Opcionalmente, si quieres relacionar directamente con el estudiante
  @ManyToOne(() => Student, { nullable: true })
  student: Student;
}