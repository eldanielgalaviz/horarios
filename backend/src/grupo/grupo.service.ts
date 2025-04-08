import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
  ) {}

  async create(createGrupoDto: CreateGrupoDto): Promise<Grupo> {
    const grupo = this.grupoRepository.create(createGrupoDto);
    return this.grupoRepository.save(grupo);
  }

  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.find({ relations: ['alumnos'] });
  }

  async findOne(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({ 
      where: { ID_Grupo: id }, 
      relations: ['alumnos'] 
    });
    
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    
    return grupo;
  }

  async update(id: number, updateGrupoDto: CreateGrupoDto): Promise<Grupo> {
    const grupo = await this.findOne(id);
    this.grupoRepository.merge(grupo, updateGrupoDto);
    return this.grupoRepository.save(grupo);
  }

  async remove(id: number): Promise<void> {
    const result = await this.grupoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
  }
}
