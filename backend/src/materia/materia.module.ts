import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from './entities/materia.entity';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';
import { MaestroModule } from '../maestro/maestro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Materia]),
    forwardRef(() => MaestroModule)
  ],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [MateriaService],
})
export class MateriaModule {}