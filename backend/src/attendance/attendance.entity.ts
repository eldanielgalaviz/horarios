import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Class } from '../entities/class.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => Class)
  class: Class;

  @Column({ default: false })
  attended: boolean;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'text', nullable: true })
  comments: string;
}
