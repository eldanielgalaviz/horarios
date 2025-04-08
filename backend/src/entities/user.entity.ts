import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

type UserRole = 'admin' | 'teacher' | 'student';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;
}