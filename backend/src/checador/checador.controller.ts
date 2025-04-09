import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ChecadorService } from './checador.service';
import { CreateChecadorDto } from './dto/create-checador.dto';
import { Checador } from '../entities/checador.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { AsistenciaService } from '../asistencia/asistencia.service';
import { HorarioService } from '../horario/horario.service';
import { CreateAsistenciaDto } from '../asistencia/dto/create-asistencia.dto';

@Controller('checadores')
export class ChecadorController {
  constructor(
    private readonly checadorService: ChecadorService,
    private readonly asistenciaService: AsistenciaService,
    private readonly horarioService: HorarioService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createChecadorDto: CreateChecadorDto): Promise<Checador> {
    return this.checadorService.create(createChecadorDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(): Promise<Checador[]> {
    return this.checadorService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CHECADOR)
  findOne(@Param('id') id: number): Promise<Checador> {
    return this.checadorService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: number, @Body() updateChecadorDto: CreateChecadorDto): Promise<Checador> {
    return this.checadorService.update(id, updateChecadorDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.checadorService.remove(id);
  }
  
  // Nuevo endpoint para permitir a los checadores registrar asistencia para cualquier horario
  @Post('asistencias/register')
  @Roles(Role.ADMIN, Role.CHECADOR)
  async registerAttendance(@Body() data: { 
    horarioId: number; 
    fecha: string; 
    presente: boolean; 
    observaciones?: string;
    registradoPor: number;
  }): Promise<any> {
    // El checador puede registrar asistencia para cualquier horario sin restricciones
    return this.asistenciaService.registrarAsistencia(data);
  }
  
  // Nuevo endpoint para ver todos los horarios (útil para el checador)
  @Get('horarios/all')
  @Roles(Role.ADMIN, Role.CHECADOR)
  async getAllHorarios(): Promise<any> {
    return this.horarioService.findAll();
  }
  
  // Nuevo endpoint para ver todas las asistencias (útil para el checador)
  @Get('asistencias/all')
  @Roles(Role.ADMIN, Role.CHECADOR)
  async getAllAsistencias(): Promise<any> {
    return this.asistenciaService.findAll();
  }
}