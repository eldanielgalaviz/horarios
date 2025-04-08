// src/materia/materia.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { Materia } from '../entities/materia.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('materias')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMateriaDto: CreateMateriaDto): Promise<Materia> {
    return this.materiaService.create(createMateriaDto);
  }

  @Get()
  @Public() // Permitir acceso público a la lista de materias
  findAll(): Promise<Materia[]> {
    return this.materiaService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.ALUMNO, Role.CHECADOR)
  findOne(@Param('id') id: number): Promise<Materia> {
    return this.materiaService.findOne(id);
  }
  
  @Get('maestro/:id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.CHECADOR)
  findByMaestro(@Param('id') id: number): Promise<Materia[]> {
    return this.materiaService.findByMaestro(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: number, @Body() updateMateriaDto: CreateMateriaDto): Promise<Materia> {
    return this.materiaService.update(id, updateMateriaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.materiaService.remove(id);
  }
}