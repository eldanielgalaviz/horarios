import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from '../entities/materia.entity';
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
    private salonService: SalonService,
  ) {}

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    // Verificar si existe el maestro
    const maestro = await this.maestroService.findOne(createMateriaDto.Maestro_ID);
    
    // Verificar si existe el salón
    const salon = await this.salonService.findOne(createMateriaDto.Salon_ID);
    
    // Crear la nueva materia
    const materia = this.materiaRepository.create({
      Nombre: createMateriaDto.Nombre,
      Maestro: maestro,
      Salon: salon,
    });
    
    return this.materiaRepository.save(materia);
  }

  async findAll(): Promise<Materia[]> {
    return this.materiaRepository.find({ 
      relations: ['Maestro', 'Salon'] 
    });
  }

  async findOne(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({ 
      where: { ID_Materia: id }, 
      relations: ['Maestro', 'Salon'] 
    });
    
    if (!materia) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
    
    return materia;
  }
  
  async findByMaestro(maestroId: number): Promise<Materia[]> {
    return this.materiaRepository.find({
      where: {
        Maestro: { ID_Maestro: maestroId }
      },
      relations: ['Maestro', 'Salon']
    });
  }

  async update(id: number, updateMateriaDto: CreateMateriaDto): Promise<Materia> {
    const materia = await this.findOne(id);
    
    // Si se está actualizando el maestro, verificar que exista
    if (updateMateriaDto.Maestro_ID) {
      const maestro = await this.maestroService.findOne(updateMateriaDto.Maestro_ID);
      materia.Maestro = maestro;
    }
    
    // Si se está actualizando el salón, verificar que exista
    if (updateMateriaDto.Salon_ID) {
      const salon = await this.salonService.findOne(updateMateriaDto.Salon_ID);
      materia.Salon = salon;
    }
    
    // Actualizar el nombre si se proporciona
    if (updateMateriaDto.Nombre) {
      materia.Nombre = updateMateriaDto.Nombre;
    }
    
    return this.materiaRepository.save(materia);
  }

  async remove(id: number): Promise<void> {
    const result = await this.materiaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
  }
}