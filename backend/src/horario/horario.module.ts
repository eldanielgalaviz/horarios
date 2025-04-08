import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from '../entities/horario.entity';
import { HorarioController } from './horario.controller';
import { HorarioService } from './horario.service';
import { GrupoModule } from '../grupo/grupo.module';
import { MateriaModule } from '../materia/materia.module';
import { SalonModule } from '../salon/salon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario]),
    GrupoModule,
    MateriaModule,
    SalonModule
  ],
  controllers: [HorarioController],
  providers: [HorarioService],
  exports: [HorarioService],
})
export class HorarioModule {}
