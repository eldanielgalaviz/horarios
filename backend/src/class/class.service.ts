import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(classEntity: Class) {
    try {
      return await this.classRepository.save(classEntity);
    } catch (error) {
      console.error('Error al crear la clase:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const classes = await this.classRepository.find({
        relations: ['teacher', 'schedules'],
        order: {
          id: 'ASC'
        }
      });
      return classes;
    } catch (error) {
      console.error('Error al obtener las clases:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id },
        relations: ['teacher', 'schedules']
      });
      if (!classEntity) {
        throw new NotFoundException(`Clase con ID ${id} no encontrada`);
      }
      return classEntity;
    } catch (error) {
      console.error(`Error al buscar la clase ${id}:`, error);
      throw error;
    }
  }

  async update(id: number, classEntity: Partial<Class>) {
    try {
      const existingClass = await this.findOne(id);
      if (!existingClass) {
        throw new NotFoundException(`Clase con ID ${id} no encontrada`);
      }
      
      await this.classRepository.update(id, classEntity);
      return this.findOne(id);
    } catch (error) {
      console.error(`Error al actualizar la clase ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const classEntity = await this.findOne(id);
      if (!classEntity) {
        throw new NotFoundException(`Clase con ID ${id} no encontrada`);
      }
      
      await this.classRepository.delete(id);
      return { message: `Clase con ID ${id} ha sido eliminada` };
    } catch (error) {
      console.error(`Error al eliminar la clase ${id}:`, error);
      throw error;
    }
  }
}