import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Profesor } from '../profesor/entities/profesor.entity';

@Injectable()
export class HorarioService {
  constructor(
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
  ) {}

  async findAll() {
    return this.horarioRepository.find({
      relations: ['materia', 'grupo', 'profesor']
    });
  }

  async findByEstudiante(estudianteId: number) {
    // Buscar el estudiante para obtener su grupo
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId }
    });
    
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
    }
    
    // Buscar horarios del grupo del estudiante
    return this.horarioRepository.find({
      where: { grupoId: estudiante.grupoId },
      relations: ['materia', 'profesor']
    });
  }

  async findByJefeGrupo(estudianteId: number) {
    // Buscar el estudiante para verificar si es jefe de grupo
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId }
    });
    
    if (!estudiante || !estudiante.esJefeGrupo) {
      throw new NotFoundException(`El estudiante con ID ${estudianteId} no es jefe de grupo`);
    }
    
    // Buscar grupo donde el estudiante es jefe
    const grupo = await this.grupoRepository.findOne({
      where: { jefeGrupoId: estudianteId }
    });
    
    if (!grupo) {
      throw new NotFoundException(`No se encontró grupo donde el estudiante ${estudianteId} sea jefe`);
    }
    
    // Buscar horarios del grupo y también todos los profesores asignados
    const horarios = await this.horarioRepository.find({
      where: { grupoId: grupo.id },
      relations: ['materia', 'profesor']
    });
    
    // Buscar todos los horarios de los profesores que imparten al grupo
    const profesorIds = [...new Set(horarios.map(h => h.profesorId))];
    const todosHorariosProfesores = await this.horarioRepository.find({
      where: { profesorId: In(profesorIds) },
      relations: ['materia', 'grupo', 'profesor']
    });
    
    return {
      horariosGrupo: horarios,
      horariosProfesores: todosHorariosProfesores
    };
  }

  async findByProfesor(profesorId: number) {
    return this.horarioRepository.find({
      where: { profesorId },
      relations: ['materia', 'grupo']
    });
  }

  // Método para maestro.controller.ts
  async findByMaestroId(maestroId: number) {
    // Buscar al profesor por el ID de usuario
    const profesor = await this.profesorRepository.findOne({
      where: { userId: maestroId }
    });
    
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID de usuario ${maestroId} no encontrado`);
    }
    
    // Usar el ID del profesor para buscar sus horarios
    return this.horarioRepository.find({
      where: { profesorId: profesor.id },
      relations: ['materia', 'grupo']
    });
  }

  async findByGrupo(grupoId: number) {
    return this.horarioRepository.find({
      where: { grupoId },
      relations: ['materia', 'profesor']
    });
  }

  async findOne(id: number) {
    const horario = await this.horarioRepository.findOne({
      where: { id },
      relations: ['materia', 'grupo', 'profesor']
    });
    
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    
    return horario;
  }

  async create(horarioData) {
    const nuevoHorario = this.horarioRepository.create(horarioData);
    return this.horarioRepository.save(nuevoHorario);
  }

  async update(id: number, horarioData) {
    await this.horarioRepository.update(id, horarioData);
    const horarioActualizado = await this.horarioRepository.findOne({
      where: { id },
      relations: ['materia', 'grupo', 'profesor']
    });
    
    if (!horarioActualizado) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    
    return horarioActualizado;
  }

  async remove(id: number) {
    const horario = await this.horarioRepository.findOne({ where: { id } });
    
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    
    await this.horarioRepository.remove(horario);
    return { message: 'Horario eliminado correctamente' };
  }
}