import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checador } from '../entities/checador.entity';
import { ChecadorController } from './checador.controller';
import { ChecadorService } from './checador.service';
import { AsistenciaModule } from '../asistencia/asistencia.module';
import { HorarioModule } from '../horario/horario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checador]),
    AsistenciaModule,
    HorarioModule
  ],
  controllers: [ChecadorController],
  providers: [ChecadorService],
  exports: [ChecadorService],
})
export class ChecadorModule {}