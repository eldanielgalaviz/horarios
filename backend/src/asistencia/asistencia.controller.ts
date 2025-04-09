// src/asistencia/asistencia.controller.ts
import { Controller, Get, Post, Body, Put, Param, UseGuards, Req, Query } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CHECADOR)
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.asistenciaService.findAll(startDate, endDate);
  }

  @Get('profesor/:id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO)
  findByProfesor(
    @Param('id') id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.asistenciaService.findByProfesor(id, startDate, endDate);
  }

  @Get('horario/:id')
  @Roles(Role.ADMIN, Role.CHECADOR, Role.MAESTRO, Role.ALUMNO)
  findByHorario(
    @Param('id') id: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.asistenciaService.findByHorario(id, startDate, endDate);
  }

  @Post('registrar')
  @Roles(Role.ALUMNO, Role.CHECADOR)
  registrarAsistencia(@Body() data, @Req() req) {
    // Permitir al jefe de grupo o al checador registrar asistencia
    return this.asistenciaService.registrarAsistencia({
      ...data,
      registradoPor: req.user.userId
    });
  }
}