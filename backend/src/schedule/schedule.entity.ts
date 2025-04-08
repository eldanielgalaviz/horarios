import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
