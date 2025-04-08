import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly authService: AuthService,
  ) {}

  async create(teacher: Teacher) {
    // Crear primero el usuario para autenticación
    const userCreated = await this.authService.register({
      name: teacher.name,
      email: teacher.email,
      password: 'password123', // Esto debería ser cambiado o solicitado en la creación
      role: 'teacher',
    });
    
    // Ahora guardamos el profesor
    return this.teacherRepository.save(teacher);
  }

  async findAll() {
    return this.teacherRepository.find();
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }
    return teacher;
  }

  async update(id: number, teacher: Teacher) {
    const existingTeacher = await this.findOne(id);
    if (!existingTeacher) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }
    
    // Si el email cambió, actualizar también en el sistema de autenticación
    if (teacher.email && teacher.email !== existingTeacher.email) {
      await this.authService.updateUser(existingTeacher.email, {
        email: teacher.email,
        name: teacher.name,
      });
    } else if (teacher.name && teacher.name !== existingTeacher.name) {
      // Si solo cambió el nombre
      await this.authService.updateUser(existingTeacher.email, {
        name: teacher.name,
      });
    }
    
    // Actualizar el profesor en la base de datos
    await this.teacherRepository.update(id, teacher);
    return this.findOne(id);
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);
    if (!teacher) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }
    
    // Eliminar también el usuario de autenticación
    await this.authService.deleteUser(teacher.email);
    
    // Eliminar el profesor
    await this.teacherRepository.delete(id);
    return { message: `Profesor con ID ${id} ha sido eliminado` };
  }
}