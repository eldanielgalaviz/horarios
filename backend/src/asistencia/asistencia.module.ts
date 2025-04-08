import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { HorarioModule } from '../horario/horario.module';
import { AlumnoModule } from '../alumno/alumno.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia]),
    forwardRef(() => HorarioModule), // Usa forwardRef si hay dependencia circular
    forwardRef(() => AlumnoModule),  // Usa forwardRef si hay dependencia circular
    // Otros módulos que podrían necesitar forwardRef
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}