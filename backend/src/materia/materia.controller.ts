import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { Materia } from './entities/materia.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('materias')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createMateriaDto: CreateMateriaDto): Promise<Materia> {
    return this.materiaService.create(createMateriaDto);
  }

  @Get()
  @Public() // Permitir acceso público a la lista de materias
  async findAll(): Promise<Materia[]> {
    return this.materiaService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.ALUMNO, Role.CHECADOR)
  async findOne(@Param('id') id: number): Promise<Materia> {
    return this.materiaService.findOne(id);
  }
  
  @Get('maestro/:id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.CHECADOR)
  async findByProfesor(@Param('id') id: number): Promise<Materia[]> {
    return this.materiaService.findByProfesor(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: number, @Body() updateMateriaDto: CreateMateriaDto): Promise<Materia> {
    return this.materiaService.update(id, updateMateriaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: number): Promise<any> {
    return this.materiaService.remove(id);
  }
}