import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salon } from '../entities/salon.entity';
import { CreateSalonDto } from './dto/create-salon.dto';

@Injectable()
export class SalonService {
  constructor(
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
  ) {}

  async create(createSalonDto: CreateSalonDto): Promise<Salon> {
    // Verificar si ya existe un salón con el mismo nombre
    const existingSalon = await this.salonRepository.findOne({ 
      where: { Nombre: createSalonDto.Nombre } 
    });
    
    if (existingSalon) {
      throw new ConflictException('Ya existe un salón con este nombre');
    }
    
    // Crear el nuevo salón
    const salon = this.salonRepository.create(createSalonDto);
    return this.salonRepository.save(salon);
  }

  async findAll(): Promise<Salon[]> {
    return this.salonRepository.find({ 
      relations: ['materias'] 
    });
  }

  async findOne(id: number): Promise<Salon> {
    const salon = await this.salonRepository.findOne({ 
      where: { ID_Salon: id }, 
      relations: ['materias'] 
    });
    
    if (!salon) {
      throw new NotFoundException(`Salón con ID ${id} no encontrado`);
    }
    
    return salon;
  }

  async update(id: number, updateSalonDto: CreateSalonDto): Promise<Salon> {
    const salon = await this.findOne(id);
    
    // Si se está actualizando el nombre, verificar que no exista otro salón con ese nombre
    if (updateSalonDto.Nombre !== salon.Nombre) {
      const existingSalon = await this.salonRepository.findOne({ 
        where: { Nombre: updateSalonDto.Nombre } 
      });
      
      if (existingSalon && existingSalon.ID_Salon !== id) {
        throw new ConflictException('Ya existe un salón con este nombre');
      }
    }
    
    this.salonRepository.merge(salon, updateSalonDto);
    return this.salonRepository.save(salon);
  }

  async remove(id: number): Promise<void> {
    const result = await this.salonRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Salón con ID ${id} no encontrado`);
    }
  }
}