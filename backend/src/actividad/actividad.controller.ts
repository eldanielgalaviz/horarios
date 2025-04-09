// src/actividad/actividad.controller.ts
import { Controller, Get, Post, Body, Put, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Get('horario/:id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.ALUMNO)
  findByHorario(
    @Param('id') id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.actividadService.findByHorario(id, startDate, endDate);
  }

  @Post('registrar')
  @Roles(Role.ALUMNO) // Solo jefes de grupo pueden registrar actividades
  registrarActividad(@Body() data, @Req() req) {
    return this.actividadService.registrarActividad({
      ...data,
      registradoPor: req.user.userId
    });
  }

  @Get('grupo/:id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.ALUMNO)
  findByGrupo(
    @Param('id') id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.actividadService.findByGrupo(id, startDate, endDate);
  }
}