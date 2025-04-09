import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaProfesor } from './entities/asistencia-profesor.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { User } from '../auth/entities/user.entity';
import { Grupo } from '../grupo/entities/grupo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsistenciaProfesor, Horario, Estudiante, User, Grupo])
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService]
})
export class AsistenciaModule {}