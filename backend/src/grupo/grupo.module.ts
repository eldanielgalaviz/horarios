import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '../entities/grupo.entity';
import { GrupoController } from './grupo.controller';
import { GrupoService } from './grupo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo])],
  controllers: [GrupoController],
  providers: [GrupoService],
  exports: [GrupoService],
})
export class GrupoModule {}