import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioController } from './horario.controller';
import { HorarioService } from './horario.service';
import { Horario } from './entities/horario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Profesor } from '../profesor/entities/profesor.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario, Estudiante, Grupo, Profesor]),
    AuthModule
  ],
  controllers: [HorarioController],
  providers: [HorarioService],
  exports: [HorarioService]
})
export class HorarioModule {}