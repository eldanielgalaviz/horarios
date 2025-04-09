import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ActividadClase } from './entities/actividad-clase.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Grupo } from '../grupo/entities/grupo.entity';

@Injectable()
export class ActividadService {
  constructor(
    @InjectRepository(ActividadClase)
    private actividadRepository: Repository<ActividadClase>,
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
  ) {}

  async findByHorario(horarioId: number, startDate?: string, endDate?: string) {
    const whereCondition = {
      horarioId,
      ...this.createDateFilter(startDate, endDate)
    };
    
    return this.actividadRepository.find({
      where: whereCondition,
      relations: ['horario', 'horario.materia', 'horario.profesor'],
      order: { fecha: 'DESC' }
    });
  }
  
  async findByGrupo(grupoId: number, startDate?: string, endDate?: string) {
    // Encontrar todos los horarios del grupo
    const horarios = await this.horarioRepository.find({
      where: { grupoId }
    });
    
    if (horarios.length === 0) {
      return [];
    }
    
    const horarioIds = horarios.map(h => h.id);
    const whereCondition = {
      horarioId: In(horarioIds),
      ...this.createDateFilter(startDate, endDate)
    };
    
    return this.actividadRepository.find({
      where: whereCondition,
      relations: ['horario', 'horario.materia', 'horario.profesor'],
      order: { fecha: 'DESC' }
    });
  }
  
  async registrarActividad(data) {
    const { horarioId, fecha, tema, actividades, tareas, registradoPor } = data;
    
    // Verificar que el horario existe
    const horario = await this.horarioRepository.findOne({
      where: { id: horarioId },
      relations: ['grupo']
    });
    
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${horarioId} no encontrado`);
    }
    
    // Verificar que el usuario es jefe de grupo
    const estudiante = await this.estudianteRepository.findOne({
      where: { userId: registradoPor }
    });
    
    if (!estudiante || !estudiante.esJefeGrupo) {
      throw new ForbiddenException('Solo los jefes de grupo pueden registrar actividades');
    }
    
    // Verificar si es jefe del grupo asignado a este horario
    const grupo = await this.grupoRepository.findOne({
      where: { jefeGrupoId: estudiante.id }
    });
    
    if (!grupo || grupo.id !== horario.grupoId) {
      throw new ForbiddenException('No eres jefe de este grupo');
    }
    
    // Verificar si ya existe registro para esta fecha y horario
    const registroExistente = await this.actividadRepository.findOne({
      where: { horarioId, fecha: new Date(fecha) }
    });
    
    if (registroExistente) {
      // Actualizar registro existente
      registroExistente.tema = tema;
      registroExistente.actividades = actividades;
      registroExistente.tareas = tareas;
      
      return this.actividadRepository.save(registroExistente);
    }
    
    // Crear nuevo registro
    const nuevaActividad = this.actividadRepository.create({
      horarioId,
      fecha: new Date(fecha),
      tema,
      actividades,
      tareas,
      registradoPor: estudiante.id
    });
    
    return this.actividadRepository.save(nuevaActividad);
  }

  private createDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      return {};
    }
    
    if (startDate && endDate) {
      return { fecha: Between(new Date(startDate), new Date(endDate)) };
    }
    
    if (startDate) {
      return { fecha: MoreThanOrEqual(new Date(startDate)) };
    }
    
    if (endDate) {
      return { fecha: LessThanOrEqual(new Date(endDate)) };
    }
    
    return {};
  }
}