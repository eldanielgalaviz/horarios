import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ClassService } from './class.service';
import { Class } from '../entities/class.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  async create(@Body() classEntity: Class) {
    try {
      const result = await this.classService.create(classEntity);
      return {
        message: 'Clase creada exitosamente',
        data: result
      };
    } catch (error) {
      console.error('Error al crear clase:', error);
      throw new HttpException(
        error.message || 'Error al crear clase',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const classes = await this.classService.findAll();
      return {
        message: 'Clases obtenidas exitosamente',
        data: classes
      };
    } catch (error) {
      console.error('Error al obtener clases:', error);
      throw new HttpException(
        error.message || 'Error al obtener clases',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const classEntity = await this.classService.findOne(+id);
      return {
        message: 'Clase obtenida exitosamente',
        data: classEntity
      };
    } catch (error) {
      console.error('Error al obtener clase:', error);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Error al obtener clase',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() classEntity: Class) {
    try {
      const updatedClass = await this.classService.update(+id, classEntity);
      return {
        message: 'Clase actualizada exitosamente',
        data: updatedClass
      };
    } catch (error) {
      console.error('Error al actualizar clase:', error);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Error al actualizar clase',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.classService.remove(+id);
      return {
        message: 'Clase eliminada exitosamente',
        data: null
      };
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Error al eliminar clase',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}