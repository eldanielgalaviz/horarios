// src/horario/horario.controller.ts
import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, Req, Query } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('horarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CHECADOR)
  findAll() {
    return this.horarioService.findAll();
  }

  @Get('estudiante')
  @Roles(Role.ALUMNO)
  findForEstudiante(@Req() req) {
    // Obtiene los horarios del estudiante loggeado
    return this.horarioService.findByEstudiante(req.user.userId);
  }

  @Get('jefe-grupo')
  @Roles(Role.ALUMNO)
  findForJefeGrupo(@Req() req) {
    // Obtiene los horarios del grupo donde el estudiante es jefe
    return this.horarioService.findByJefeGrupo(req.user.userId);
  }

  @Get('profesor')
  @Roles(Role.MAESTRO)
  findForProfesor(@Req() req) {
    // Obtiene los horarios asignados al profesor
    return this.horarioService.findByProfesor(req.user.userId);
  }

  @Get('grupo/:id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.ALUMNO)
  findByGrupo(@Param('id') id: number) {
    return this.horarioService.findByGrupo(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.CHECADOR)
  create(@Body() horarioData) {
    return this.horarioService.create(horarioData);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.CHECADOR)
  update(@Param('id') id: number, @Body() horarioData) {
    return this.horarioService.update(id, horarioData);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.CHECADOR)
  remove(@Param('id') id: number) {
    return this.horarioService.remove(id);
  }
}