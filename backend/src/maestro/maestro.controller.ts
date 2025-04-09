import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { MaestroService } from './maestro.service';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { Maestro } from '../entities/maestro.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { MateriaService } from '../materia/materia.service';
import { HorarioService } from '../horario/horario.service';
import { AsistenciaService } from '../asistencia/asistencia.service';
import { AsistenciaProfesor } from '../asistencia/entities/asistencia-profesor.entity';

@Controller('maestros')
export class MaestroController {
  constructor(
    private readonly maestroService: MaestroService,
    private readonly materiaService: MateriaService,
    private readonly horarioService: HorarioService,
    private readonly asistenciaService: AsistenciaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMaestroDto: CreateMaestroDto): Promise<Maestro> {
    return this.maestroService.create(createMaestroDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CHECADOR)
  findAll(): Promise<Maestro[]> {
    return this.maestroService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  async findOne(@Request() req, @Param('id') id: number): Promise<Maestro> {
    // Si es maestro, solo puede ver su propio perfil
    if (req.user.userType === Role.MAESTRO && req.user.userId !== id) {
      throw new ForbiddenException('Solo puedes ver tu propio perfil');
    }
    
    return this.maestroService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: number, @Body() updateMaestroDto: CreateMaestroDto): Promise<Maestro> {
    return this.maestroService.update(id, updateMaestroDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.maestroService.remove(id);
  }
  
  // Nuevo endpoint para que un maestro pueda ver su propio perfil
  @Get('me/profile')
  @Roles(Role.MAESTRO)
  async getOwnProfile(@Request() req): Promise<Maestro> {
    return this.maestroService.findOne(req.user.userId);
  }
  
  // Nuevo endpoint para que un maestro pueda ver sus propias materias
  @Get('me/materias')
  @Roles(Role.MAESTRO)
  async getOwnMaterias(@Request() req): Promise<any> {
    const maestro = await this.maestroService.findOne(req.user.userId);
    // Cambiar findByProfesor por otro método en MateriaService o usar findAll con filtro
    return this.materiaService.findAll(); // Modificar según la implementación correcta
  }
  
  // Nuevo endpoint para que un maestro pueda ver los horarios de sus materias
  @Get('me/horarios')
  @Roles(Role.MAESTRO)
  async getOwnHorarios(@Request() req): Promise<any> {
    return this.horarioService.findByMaestroId(req.user.userId);
  }
  
  // Nuevo endpoint para que un maestro pueda ver las asistencias de sus materias
  @Get('me/asistencias')
  @Roles(Role.MAESTRO)
  async getOwnAsistencias(@Request() req): Promise<any> {
    const horarios = await this.horarioService.findByMaestroId(req.user.userId);
    
    // Obtener las asistencias para todos los horarios de las materias del maestro
    const asistencias: AsistenciaProfesor[] = [];
    for (const horario of horarios) {
      const horarioAsistencias = await this.asistenciaService.findByHorario(horario.id);
      if (horarioAsistencias.length > 0) {
        asistencias.push(...horarioAsistencias);
      }
    }
    
    return asistencias;
  }
}