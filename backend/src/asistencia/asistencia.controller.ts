// src/asistencia/asistencia.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, Request } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { Asistencia } from '../entities/asistencia.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { HorarioService } from '../horario/horario.service';
import { AlumnoService } from '../alumno/alumno.service';
import { ParseDatePipe } from '../pipes/parse-date.pipe';

@Controller('asistencias')
export class AsistenciaController {
  constructor(
    private readonly asistenciaService: AsistenciaService,
    private readonly horarioService: HorarioService,
    private readonly alumnoService: AlumnoService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.CHECADOR, Role.ALUMNO)
  async create(@Request() req, @Body() createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    // Verificar si el usuario es un alumno
    if (req.user.userType === Role.ALUMNO) {
      // Verificar que el horario pertenezca al grupo del alumno
      const horario = await this.horarioService.findOne(createAsistenciaDto.Horario_ID);
      const alumno = await this.alumnoService.findOne(req.user.userId);
      
      // Si el grupo del horario no coincide con el grupo del alumno
      if (horario.Grupo.ID_Grupo !== alumno.Grupo.ID_Grupo) {
        throw new Error('No tienes permiso para registrar asistencia en este horario');
      }
    }
    
    // Si es admin, checador o pasó la validación de alumno
    return this.asistenciaService.create(createAsistenciaDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CHECADOR)
  findAll(): Promise<Asistencia[]> {
    return this.asistenciaService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Asistencia> {
    return this.asistenciaService.findOne(id);
  }
  
  @Get('horario/:id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO, Role.ALUMNO)
  async findByHorario(@Request() req, @Param('id', ParseIntPipe) horarioId: number): Promise<Asistencia[]> {
    // Si es alumno, verificar que el horario corresponda a su grupo
    if (req.user.userType === Role.ALUMNO) {
      const horario = await this.horarioService.findOne(horarioId);
      const alumno = await this.alumnoService.findOne(req.user.userId);
      
      if (horario.Grupo.ID_Grupo !== alumno.Grupo.ID_Grupo) {
        throw new Error('No tienes permiso para ver las asistencias de este horario');
      }
    }
    
    // Si es maestro, verificar que el horario corresponda a una de sus materias
    if (req.user.userType === Role.MAESTRO) {
      const horario = await this.horarioService.findOne(horarioId);
      
      if (horario.Materia.Maestro.ID_Maestro !== req.user.userId) {
        throw new Error('No tienes permiso para ver las asistencias de este horario');
      }
    }
    
    return this.asistenciaService.findByHorario(horarioId);
  }
  

  
  @Get('fecha/rango')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
findByFecha(
  @Query('fechaInicio', new ParseDatePipe()) fechaInicio: Date,
  @Query('fechaFin', new ParseDatePipe()) fechaFin: Date
): Promise<Asistencia[]> {
  return this.asistenciaService.findByFecha(fechaInicio, fechaFin);
}
  
  @Get('grupo/:id/fecha')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  async findByGrupoAndFecha(
    @Request() req,
    @Param('id', ParseIntPipe) grupoId: number,
    @Query('fechaInicio', ParseDatePipe) fechaInicio: Date,
    @Query('fechaFin', ParseDatePipe) fechaFin: Date
  ): Promise<Asistencia[]> {
    // Si es maestro, verificar que enseñe a este grupo
    if (req.user.userType === Role.MAESTRO) {
      const horarios = await this.horarioService.findByMaestroId(req.user.userId);
      const gruposIds = horarios.map(h => h.Grupo.ID_Grupo);
      
      if (!gruposIds.includes(grupoId)) {
        throw new Error('No tienes permiso para ver las asistencias de este grupo');
      }
    }
    
    return this.asistenciaService.findByGrupoAndFecha(grupoId, fechaInicio, fechaFin);
  }
  
  @Get('maestro/:id/fecha')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  findByMaestroAndFecha(
    @Request() req,
    @Param('id', ParseIntPipe) maestroId: number,
    @Query('fechaInicio', ParseDatePipe) fechaInicio: Date,
    @Query('fechaFin', ParseDatePipe) fechaFin: Date
  ): Promise<Asistencia[]> {
    // Si es maestro, solo puede ver sus propias asistencias
    if (req.user.userType === Role.MAESTRO && req.user.userId !== maestroId) {
      throw new Error('Solo puedes ver tus propias asistencias');
    }
    
    return this.asistenciaService.findByMaestroAndFecha(maestroId, fechaInicio, fechaFin);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.CHECADOR)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAsistenciaDto: CreateAsistenciaDto
  ): Promise<Asistencia> {
    return this.asistenciaService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.asistenciaService.remove(id);
  }
}