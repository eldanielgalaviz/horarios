import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Maestro } from './maestro.entity';
import { Salon } from './salon.entity';

@Entity()
export class Materia {
  @PrimaryGeneratedColumn()
  ID_Materia: number;

  @Column()
  Nombre: string;

  @ManyToOne(() => Maestro, maestro => maestro.materias)
  @JoinColumn({ name: 'Maestro_ID' })
  Maestro: Maestro;

  @ManyToOne(() => Salon, salon => salon.materias)
  @JoinColumn({ name: 'Salon_ID' })
  Salon: Salon;
}