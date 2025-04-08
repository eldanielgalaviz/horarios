import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maestro } from '../entities/maestro.entity';
import { MaestroController } from './maestro.controller';
import { MaestroService } from './maestro.service';
import { MateriaModule } from '../materia/materia.module';
import { HorarioModule } from '../horario/horario.module';
import { AsistenciaModule } from '../asistencia/asistencia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maestro]),
    forwardRef(() => MateriaModule),
    forwardRef(() => HorarioModule),
    forwardRef(() => AsistenciaModule)
  ],
  controllers: [MaestroController],
  providers: [MaestroService],
  exports: [MaestroService],
})
export class MaestroModule {}