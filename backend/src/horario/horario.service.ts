// src/horario/horario.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from '../entities/horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { GrupoService } from '../grupo/grupo.service';
import { MateriaService } from '../materia/materia.service';
import { SalonService } from '../salon/salon.service';

@Injectable()
export class HorarioService {
  constructor(
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
    private grupoService: GrupoService,
    private materiaService: MateriaService,
    private salonService: SalonService,
  ) {}

  async create(createHorarioDto: CreateHorarioDto): Promise<Horario> {
    // Verificar si el grupo existe
    const grupo = await this.grupoService.findOne(createHorarioDto.Grupo_ID);
    
    // Verificar si la materia existe
    const materia = await this.materiaService.findOne(createHorarioDto.Materia_ID);
    
    // Verificar si el salón existe
    const salon = await this.salonService.findOne(createHorarioDto.Salon_ID);
    
    // Verificar si ya existe un horario en el mismo salón, día y hora
    const existingHorario = await this.horarioRepository.findOne({ 
      where: { 
        Salon: { ID_Salon: salon.ID_Salon },
        Dias: createHorarioDto.Dias,
        HoraInicio: createHorarioDto.HoraInicio
      } 
    });
    
    if (existingHorario) {
      throw new ConflictException('Ya existe un horario asignado a este salón en ese día y hora');
    }
    
    // Crear el nuevo horario
    const horario = this.horarioRepository.create({
      Grupo: grupo,
      Materia: materia,
      Salon: salon,
      HoraInicio: createHorarioDto.HoraInicio,
      HoraFin: createHorarioDto.HoraFin,
      Dias: createHorarioDto.Dias
    });
    
    return this.horarioRepository.save(horario);
  }

  async findAll(): Promise<Horario[]> {
    return this.horarioRepository.find({ 
      relations: ['Grupo', 'Materia', 'Materia.Maestro', 'Salon', 'asistencias'] 
    });
  }

  async findOne(id: number): Promise<Horario> {
    const horario = await this.horarioRepository.findOne({ 
      where: { ID: id }, 
      relations: ['Grupo', 'Materia', 'Materia.Maestro', 'Salon', 'asistencias'] 
    });
    
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    
    return horario;
  }
  
  async findByGrupo(grupoId: number): Promise<Horario[]> {
    return this.horarioRepository.find({
      where: { Grupo: { ID_Grupo: grupoId } },
      relations: ['Grupo', 'Materia', 'Materia.Maestro', 'Salon', 'asistencias']
    });
  }
  
  async findByMaestroId(maestroId: number): Promise<Horario[]> {
    return this.horarioRepository.find({
      where: { Materia: { Maestro: { ID_Maestro: maestroId } } },
      relations: ['Grupo', 'Materia', 'Materia.Maestro', 'Salon', 'asistencias']
    });
  }

  async update(id: number, updateHorarioDto: CreateHorarioDto): Promise<Horario> {
    const horario = await this.findOne(id);
    
    // Verificar si el grupo existe
    if (updateHorarioDto.Grupo_ID) {
      const grupo = await this.grupoService.findOne(updateHorarioDto.Grupo_ID);
      horario.Grupo = grupo;
    }
    
    // Verificar si la materia existe
    if (updateHorarioDto.Materia_ID) {
      const materia = await this.materiaService.findOne(updateHorarioDto.Materia_ID);
      horario.Materia = materia;
    }
    
    // Verificar si el salón existe
    if (updateHorarioDto.Salon_ID) {
      const salon = await this.salonService.findOne(updateHorarioDto.Salon_ID);
      horario.Salon = salon;
    }
    
    // Actualizar hora de inicio si se proporciona
    if (updateHorarioDto.HoraInicio) {
      horario.HoraInicio = updateHorarioDto.HoraInicio;
    }
    
    // Actualizar hora de fin si se proporciona
    if (updateHorarioDto.HoraFin) {
      horario.HoraFin = updateHorarioDto.HoraFin;
    }
    
    // Actualizar días si se proporciona
    if (updateHorarioDto.Dias) {
      horario.Dias = updateHorarioDto.Dias;
    }
    
    return this.horarioRepository.save(horario);
  }

  async remove(id: number): Promise<void> {
    const result = await this.horarioRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
  }
}