import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from './entities/materia.entity';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { SalonService } from '../salon/salon.service';
import { forwardRef } from '@nestjs/common';
import { MaestroService } from '../maestro/maestro.service';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
    @Inject(forwardRef(() => MaestroService))
    private maestroService: MaestroService,
  ) {}

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    // Verificar si existe el profesor
    const profesor = await this.maestroService.findOne(createMateriaDto.profesorId);
    
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${createMateriaDto.profesorId} no encontrado`);
    }
    
    // Crear la nueva materia
    const nuevaMateria = this.materiaRepository.create({
      nombre: createMateriaDto.nombre,
      codigo: createMateriaDto.codigo,
      creditos: createMateriaDto.creditos,
      profesorId: createMateriaDto.profesorId,
    });
    
    return this.materiaRepository.save(nuevaMateria);
  }

  async findAll(): Promise<Materia[]> {
    return this.materiaRepository.find({ 
      relations: ['profesor'] 
    });
  }

  async findOne(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({ 
      where: { id }, 
      relations: ['profesor'] 
    });
    
    if (!materia) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
    
    return materia;
  }
  
  async findByProfesor(profesorId: number): Promise<Materia[]> {
    return this.materiaRepository.find({
      where: {
        profesorId
      },
      relations: ['profesor']
    });
  }

  async update(id: number, updateMateriaDto: CreateMateriaDto): Promise<Materia> {
    const materia = await this.findOne(id);
    
    // Si se está actualizando el profesor, verificar que exista
    if (updateMateriaDto.profesorId) {
      const profesor = await this.maestroService.findOne(updateMateriaDto.profesorId);
      if (!profesor) {
        throw new NotFoundException(`Profesor con ID ${updateMateriaDto.profesorId} no encontrado`);
      }
    }
    
    // Actualizar los campos
    if (updateMateriaDto.nombre) {
      materia.nombre = updateMateriaDto.nombre;
    }
    
    if (updateMateriaDto.codigo) {
      materia.codigo = updateMateriaDto.codigo;
    }
    
    if (updateMateriaDto.creditos) {
      materia.creditos = updateMateriaDto.creditos;
    }
    
    if (updateMateriaDto.profesorId) {
      materia.profesorId = updateMateriaDto.profesorId;
    }
    
    return this.materiaRepository.save(materia);
  }

  async remove(id: number): Promise<{ message: string }> {
    const materia = await this.findOne(id);
    await this.materiaRepository.remove(materia);
    return { message: `Materia con ID ${id} eliminada correctamente` };
  }
}