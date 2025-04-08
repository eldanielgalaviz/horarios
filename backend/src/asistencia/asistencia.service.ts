import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asistencia } from '../entities/asistencia.entity';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { HorarioService } from '../horario/horario.service';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
    private horarioService: HorarioService,
  ) {}

  async create(createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    // Verificar si el horario existe
    const horario = await this.horarioService.findOne(createAsistenciaDto.Horario_ID);
    
    // Verificar si ya existe una asistencia para este horario y fecha
    const existingAsistencia = await this.asistenciaRepository.findOne({ 
      where: { 
        Horario: { ID: horario.ID },
        Fecha: createAsistenciaDto.Fecha
      } 
    });
    
    if (existingAsistencia) {
      throw new ConflictException('Ya existe un registro de asistencia para este horario y fecha');
    }
    
    // Crear el nuevo registro de asistencia
    const asistencia = this.asistenciaRepository.create({
      Horario: horario,
      Asistio: createAsistenciaDto.Asistio,
      Fecha: createAsistenciaDto.Fecha
    });
    
    return this.asistenciaRepository.save(asistencia);
  }

  async findAll(): Promise<Asistencia[]> {
    return this.asistenciaRepository.find({ 
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro'] 
    });
  }

  async findOne(id: number): Promise<Asistencia> {
    const asistencia = await this.asistenciaRepository.findOne({ 
      where: { ID: id }, 
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro'] 
    });
    
    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }
    
    return asistencia;
  }
  
  async findByHorario(horarioId: number): Promise<Asistencia[]> {
    return this.asistenciaRepository.find({
      where: { Horario: { ID: horarioId } },
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro']
    });
  }
  
  async findByFecha(fechaInicio: Date, fechaFin: Date): Promise<Asistencia[]> {
    return this.asistenciaRepository.find({
      where: { 
        Fecha: Between(fechaInicio, fechaFin) 
      },
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro']
    });
  }
  
  async findByGrupoAndFecha(grupoId: number, fechaInicio: Date, fechaFin: Date): Promise<Asistencia[]> {
    return this.asistenciaRepository.find({
      where: { 
        Horario: { Grupo: { ID_Grupo: grupoId } },
        Fecha: Between(fechaInicio, fechaFin) 
      },
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro']
    });
  }
  
  async findByMaestroAndFecha(maestroId: number, fechaInicio: Date, fechaFin: Date): Promise<Asistencia[]> {
    return this.asistenciaRepository.find({
      where: { 
        Horario: { Materia: { Maestro: { ID_Maestro: maestroId } } },
        Fecha: Between(fechaInicio, fechaFin) 
      },
      relations: ['Horario', 'Horario.Grupo', 'Horario.Materia', 'Horario.Materia.Maestro']
    });
  }

  async update(id: number, updateAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    const asistencia = await this.findOne(id);
    
    // Si se está actualizando el horario, verificar que exista
    if (updateAsistenciaDto.Horario_ID) {
      const horario = await this.horarioService.findOne(updateAsistenciaDto.Horario_ID);
      asistencia.Horario = horario;
    }
    
    // Actualizar estado de asistencia si se proporciona
    if (updateAsistenciaDto.Asistio !== undefined) {
      asistencia.Asistio = updateAsistenciaDto.Asistio;
    }
    
    // Actualizar fecha si se proporciona
    if (updateAsistenciaDto.Fecha) {
      asistencia.Fecha = updateAsistenciaDto.Fecha;
    }
    
    return this.asistenciaRepository.save(asistencia);
  }

  async remove(id: number): Promise<void> {
    const result = await this.asistenciaRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }
  }
}