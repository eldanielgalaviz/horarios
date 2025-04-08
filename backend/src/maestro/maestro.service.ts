import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maestro } from '../entities/maestro.entity';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { forwardRef } from '@nestjs/common';
import { MateriaService } from '../materia/materia.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MaestroService {
  constructor(
    @InjectRepository(Maestro)
    private maestroRepository: Repository<Maestro>,
    // Si necesitas MateriaService, inyéctalo así:
    @Inject(forwardRef(() => MateriaService))
    private materiaService: MateriaService,
  ) {}

  async create(createMaestroDto: CreateMaestroDto): Promise<Maestro> {
    // Verificar si ya existe un maestro con el mismo correo
    const existingMaestro = await this.maestroRepository.findOne({ 
      where: { Correo: createMaestroDto.Correo } 
    });
    
    if (existingMaestro) {
      throw new ConflictException('Ya existe un maestro con este correo');
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createMaestroDto.Contraseña, 10);
    
    // Crear el nuevo maestro
    const maestro = this.maestroRepository.create({
      ...createMaestroDto,
      Contraseña: hashedPassword,
    });
    
    return this.maestroRepository.save(maestro);
  }

  async findAll(): Promise<Maestro[]> {
    return this.maestroRepository.find({ 
      relations: ['materias'] 
    });
  }

  async findOne(id: number): Promise<Maestro> {
    const maestro = await this.maestroRepository.findOne({ 
      where: { ID_Maestro: id }, 
      relations: ['materias'] 
    });
    
    if (!maestro) {
      throw new NotFoundException(`Maestro con ID ${id} no encontrado`);
    }
    
    return maestro;
  }

  async findByEmail(email: string): Promise<Maestro | null> {
    return this.maestroRepository.findOne({ 
      where: { Correo: email } 
    });
  }

  async update(id: number, updateMaestroDto: CreateMaestroDto): Promise<Maestro> {
    const maestro = await this.findOne(id);
    
    // Si se está actualizando el correo, verificar que no exista otro maestro con ese correo
    if (updateMaestroDto.Correo !== maestro.Correo) {
      const existingMaestro = await this.maestroRepository.findOne({ 
        where: { Correo: updateMaestroDto.Correo } 
      });
      
      if (existingMaestro && existingMaestro.ID_Maestro !== id) {
        throw new ConflictException('Ya existe un maestro con este correo');
      }
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (updateMaestroDto.Contraseña) {
      updateMaestroDto.Contraseña = await bcrypt.hash(updateMaestroDto.Contraseña, 10);
    }
    
    this.maestroRepository.merge(maestro, updateMaestroDto);
    return this.maestroRepository.save(maestro);
  }

  async remove(id: number): Promise<void> {
    const result = await this.maestroRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Maestro con ID ${id} no encontrado`);
    }
  }
}
