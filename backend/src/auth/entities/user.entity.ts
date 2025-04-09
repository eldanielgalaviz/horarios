import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['estudiante', 'profesor', 'checador', 'admin'],
    default: 'estudiante'
  })
  role: string;

  @Column({ default: true })
  activo: boolean;
}