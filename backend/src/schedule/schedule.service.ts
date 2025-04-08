import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Student } from '../entities/student.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>
  ) {}

  async create(schedule: Schedule): Promise<Schedule> {
    // Validar que el estudiante existe
    if (schedule.studentId) {
      const student = await this.studentRepository.findOne({ where: { id: schedule.studentId } });
      if (!student) {
        throw new NotFoundException(`Estudiante con ID ${schedule.studentId} no encontrado`);
      }
    }
    
    return this.scheduleRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.find();
  }

  async findByStudent(studentId: number): Promise<Schedule[]> {
    // Primero verificamos que el estudiante existe
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${studentId} no encontrado`);
    }
    
    return this.scheduleRepository.find({ where: { studentId } });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    return schedule;
  }

  async update(id: number, scheduleData: Schedule): Promise<Schedule> {
    const schedule = await this.findOne(id);
    
    // Validar que el estudiante existe si se está actualizando
    if (scheduleData.studentId && scheduleData.studentId !== schedule.studentId) {
      const student = await this.studentRepository.findOne({ where: { id: scheduleData.studentId } });
      if (!student) {
        throw new NotFoundException(`Estudiante con ID ${scheduleData.studentId} no encontrado`);
      }
    }
    
    await this.scheduleRepository.update(id, scheduleData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.delete(id);
    return { message: `Horario con ID ${id} eliminado correctamente` };
  }
}