import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body() schedule: Schedule, @Req() req) {
    try {
      return await this.scheduleService.create(schedule);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear horario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll(@Query() query) {
    try {
      // Si hay un studentId en la query, filtramos por estudiante
      if (query.studentId) {
        return await this.scheduleService.findByStudent(parseInt(query.studentId));
      }
      
      // Si no hay filtros, retornamos todos
      return await this.scheduleService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener horarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.scheduleService.findOne(+id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener horario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() schedule: Schedule) {
    try {
      return await this.scheduleService.update(+id, schedule);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar horario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.scheduleService.remove(+id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar horario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}