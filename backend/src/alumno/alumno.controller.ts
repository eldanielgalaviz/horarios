// src/alumno/alumno.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Request, ForbiddenException, UseGuards } from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { Alumno } from '../entities/alumno.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { HorarioService } from '../horario/horario.service';
import { AsistenciaService } from '../asistencia/asistencia.service';
import { CreateAsistenciaDto } from '../asistencia/dto/create-asistencia.dto';
import { Asistencia } from '../entities/asistencia.entity';

@Controller('alumnos')
export class AlumnoController {
  constructor(
    private readonly alumnoService: AlumnoService,
    private readonly horarioService: HorarioService,
    private readonly asistenciaService: AsistenciaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    return this.alumnoService.create(createAlumnoDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  findAll(): Promise<Alumno[]> {
    return this.alumnoService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO, Role.ALUMNO)
  async findOne(@Request() req, @Param('id') id: number): Promise<Alumno> {
    // Si es alumno, solo puede ver su propio perfil
    if (req.user.userType === Role.ALUMNO && req.user.userId !== id) {
      throw new ForbiddenException('Solo puedes ver tu propio perfil');
    }
    
    return this.alumnoService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: number, @Body() updateAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    return this.alumnoService.update(id, updateAlumnoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.alumnoService.remove(id);
  }
  
  // Endpoint para que un alumno pueda ver su propio perfil
  @Get('me/profile')
  @Roles(Role.ALUMNO)
  async getOwnProfile(@Request() req): Promise<Alumno> {
    return this.alumnoService.findOne(req.user.userId);
  }
  
  // Endpoint para que un alumno pueda ver los horarios de su grupo
  @Get('me/horarios')
  @Roles(Role.ALUMNO)
  async getOwnHorarios(@Request() req): Promise<any> {
    const alumno = await this.alumnoService.findOne(req.user.userId);
    return this.horarioService.findByGrupo(alumno.Grupo.ID_Grupo);
  }
  
  // Nuevo endpoint para que un alumno pueda registrar su asistencia a un horario específico
  @Post('me/asistencia')
  @Roles(Role.ALUMNO)
  async registerOwnAttendance(@Request() req, @Body() createAsistenciaDto: CreateAsistenciaDto): Promise<any> {
    const alumno = await this.alumnoService.findOne(req.user.userId);
    const horario = await this.horarioService.findOne(createAsistenciaDto.Horario_ID);
    
    // Verificar que el horario pertenezca al grupo del alumno
    if (horario.Grupo.ID_Grupo !== alumno.Grupo.ID_Grupo) {
      throw new ForbiddenException('No puedes registrar asistencia para un horario que no pertenece a tu grupo');
    }
    
    return this.asistenciaService.create(createAsistenciaDto);
  }
  
  // Nuevo endpoint para que un alumno pueda ver sus propias asistencias
  @Get('me/asistencias')
  @Roles(Role.ALUMNO)
  async getOwnAttendance(@Request() req): Promise<any> {
    const alumno = await this.alumnoService.findOne(req.user.userId);
    const horarios = await this.horarioService.findByGrupo(alumno.Grupo.ID_Grupo);
    
    // Obtener las asistencias para todos los horarios del grupo del alumno
    

    // Usa:
    const asistencias: Asistencia[] = [];
    for (const horario of horarios) {
      const horarioAsistencias = await this.asistenciaService.findByHorario(horario.ID);
      asistencias.push(...horarioAsistencias);
    }
    
    return asistencias;
  }
}