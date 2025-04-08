import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumno } from '../entities/alumno.entity';
import { AlumnoController } from './alumno.controller';
import { AlumnoService } from './alumno.service';
import { GrupoModule } from '../grupo/grupo.module';
import { HorarioModule } from '../horario/horario.module';
import { AsistenciaModule } from '../asistencia/asistencia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alumno]),
    GrupoModule,
    HorarioModule,
    forwardRef(() => AsistenciaModule),
  ],
  controllers: [AlumnoController],
  providers: [AlumnoService],
  exports: [AlumnoService],
})
export class AlumnoModule {}