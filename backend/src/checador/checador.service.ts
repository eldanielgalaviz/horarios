import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checador } from '../entities/checador.entity';
import { CreateChecadorDto } from './dto/create-checador.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChecadorService {
  constructor(
    @InjectRepository(Checador)
    private checadorRepository: Repository<Checador>,
  ) {}

  async create(createChecadorDto: CreateChecadorDto): Promise<Checador> {
    // Verificar si ya existe un checador con el mismo correo
    const existingChecador = await this.checadorRepository.findOne({ 
      where: { Correo: createChecadorDto.Correo } 
    });
    
    if (existingChecador) {
      throw new ConflictException('Ya existe un checador con este correo');
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createChecadorDto.Contraseña, 10);
    
    // Crear el nuevo checador
    const checador = this.checadorRepository.create({
      ...createChecadorDto,
      Contraseña: hashedPassword,
    });
    
    return this.checadorRepository.save(checador);
  }

  async findAll(): Promise<Checador[]> {
    return this.checadorRepository.find();
  }

  async findOne(id: number): Promise<Checador> {
    const checador = await this.checadorRepository.findOne({ 
      where: { ID: id } 
    });
    
    if (!checador) {
      throw new NotFoundException(`Checador con ID ${id} no encontrado`);
    }
    
    return checador;
  }

  async findByEmail(email: string): Promise<Checador | null> {
    return this.checadorRepository.findOne({ 
      where: { Correo: email } 
    });
  }

  async update(id: number, updateChecadorDto: CreateChecadorDto): Promise<Checador> {
    const checador = await this.findOne(id);
    
    // Si se está actualizando el correo, verificar que no exista otro checador con ese correo
    if (updateChecadorDto.Correo !== checador.Correo) {
      const existingChecador = await this.checadorRepository.findOne({ 
        where: { Correo: updateChecadorDto.Correo } 
      });
      
      if (existingChecador && existingChecador.ID !== id) {
        throw new ConflictException('Ya existe un checador con este correo');
      }
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (updateChecadorDto.Contraseña) {
      updateChecadorDto.Contraseña = await bcrypt.hash(updateChecadorDto.Contraseña, 10);
    }
    
    this.checadorRepository.merge(checador, updateChecadorDto);
    return this.checadorRepository.save(checador);
  }

  async remove(id: number): Promise<void> {
    const result = await this.checadorRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Checador con ID ${id} no encontrado`);
    }
  }
}
