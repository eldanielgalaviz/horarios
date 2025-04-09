import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AsistenciaProfesor } from './entities/asistencia-profesor.entity';
import { Horario } from '../horario/entities/horario.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { User } from '../auth/entities/user.entity';
import { Grupo } from '../grupo/entities/grupo.entity';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(AsistenciaProfesor)
    private asistenciaRepository: Repository<AsistenciaProfesor>,
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
  ) {}

  async findAll(startDate?: string, endDate?: string) {
    const whereCondition = this.createDateFilter(startDate, endDate);
    
    return this.asistenciaRepository.find({
      where: whereCondition,
      relations: ['horario', 'horario.profesor', 'horario.materia', 'horario.grupo'],
      order: { fecha: 'DESC' }
    });
  }

  async findByProfesor(profesorId: number, startDate?: string, endDate?: string) {
    // Encontrar horarios del profesor
    const horarios = await this.horarioRepository.find({
      where: { profesorId }
    });
    
    if (horarios.length === 0) {
      return [];
    }
    
    const horarioIds = horarios.map(h => h.id);
    const whereCondition = {
      horarioId: In(horarioIds),
      ...this.createDateFilter(startDate, endDate)
    };
    
    return this.asistenciaRepository.find({
      where: whereCondition,
      relations: ['horario', 'horario.materia', 'horario.grupo'],
      order: { fecha: 'DESC' }
    });
  }

  async findByHorario(horarioId: number, startDate?: string, endDate?: string) {
    const whereCondition = {
      horarioId,
      ...this.createDateFilter(startDate, endDate)
    };
    
    return this.asistenciaRepository.find({
      where: whereCondition,
      relations: ['horario', 'horario.profesor', 'horario.materia', 'horario.grupo'],
      order: { fecha: 'DESC' }
    });
  }

  async findOne(id: number) {
    const asistencia = await this.asistenciaRepository.findOne({
      where: { id },
      relations: ['horario', 'horario.profesor', 'horario.materia', 'horario.grupo']
    });
    
    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }
    
    return asistencia;
  }

  async registrarAsistencia(data: {
    horarioId: number; 
    fecha: string; 
    presente: boolean; 
    observaciones?: string;
    registradoPor: number;
  }) {
    const { horarioId, fecha, presente, observaciones, registradoPor } = data;
    
    // Verificar que el horario existe
    const horario = await this.horarioRepository.findOne({
      where: { id: horarioId },
      relations: ['grupo']
    });
    
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${horarioId} no encontrado`);
    }
    
    // Verificar que el usuario tiene permiso para registrar asistencia
    const user = await this.userRepository.findOne({ where: { id: registradoPor } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${registradoPor} no encontrado`);
    }
    
    // Verificar si es jefe de grupo o checador
    let puedeRegistrar = false;
    
    if (user.role === 'checador' || user.role === 'admin') {
      puedeRegistrar = true;
    } else if (user.role === 'estudiante') {
      // Verificar si es jefe del grupo asignado a este horario
      const estudiante = await this.estudianteRepository.findOne({
        where: { userId: registradoPor }
      });
      
      if (estudiante && estudiante.esJefeGrupo) {
        const grupo = await this.grupoRepository.findOne({
          where: { jefeGrupoId: estudiante.id }
        });
        
        if (grupo && grupo.id === horario.grupoId) {
          puedeRegistrar = true;
        }
      }
    }
    
    if (!puedeRegistrar) {
      throw new ForbiddenException('No tiene permiso para registrar asistencia en este horario');
    }
    
    // Verificar si ya existe registro para esta fecha y horario
    const registroExistente = await this.asistenciaRepository.findOne({
      where: { 
        horarioId,
        fecha: new Date(fecha)
      }
    });
    
    if (registroExistente) {
      // Actualizar registro existente
      registroExistente.presente = presente;
      if (observaciones) {
        registroExistente.observaciones = observaciones;
      }
      registroExistente.registradoPor = registradoPor;
      
      return this.asistenciaRepository.save(registroExistente);
    }
    
    // Crear nuevo registro
    const nuevoRegistro = this.asistenciaRepository.create({
      horarioId,
      fecha: new Date(fecha),
      presente,
      observaciones,
      registradoPor
    });
    
    return this.asistenciaRepository.save(nuevoRegistro);
  }

  async create(attendance) {
    try {
      return await this.asistenciaRepository.save(attendance);
    } catch (error) {
      throw error;
    }
  }

  async getAllAttendance() {
    try {
      return await this.asistenciaRepository.find({
        relations: ['horario', 'horario.profesor', 'horario.materia', 'horario.grupo']
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, attendance) {
    try {
      await this.asistenciaRepository.update(id, attendance);
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.asistenciaRepository.delete(id);
      return { message: `Asistencia con ID ${id} ha sido eliminada` };
    } catch (error) {
      throw error;
    }
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