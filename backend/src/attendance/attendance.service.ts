import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async markAttendance(attendance: Attendance) {
    try {
      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      throw error;
    }
  }

  async getAllAttendance() {
    try {
      return await this.attendanceRepository.find({
        relations: ['student', 'class']
      });
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const attendance = await this.attendanceRepository.findOne({
        where: { id },
        relations: ['student', 'class']
      });
      if (!attendance) {
        throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
      }
      return attendance;
    } catch (error) {
      console.error(`Error al buscar asistencia ${id}:`, error);
      throw error;
    }
  }

  async update(id: number, attendance: Attendance) {
    try {
      const existingAttendance = await this.findOne(id);
      if (!existingAttendance) {
        throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
      }
      
      await this.attendanceRepository.update(id, attendance);
      return this.findOne(id);
    } catch (error) {
      console.error(`Error al actualizar asistencia ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const attendance = await this.findOne(id);
      if (!attendance) {
        throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
      }
      
      await this.attendanceRepository.delete(id);
      return { message: `Asistencia con ID ${id} ha sido eliminada` };
    } catch (error) {
      console.error(`Error al eliminar asistencia ${id}:`, error);
      throw error;
    }
  }
}