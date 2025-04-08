import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(student: Student) {
    return this.studentRepository.save(student);
  }

  async findAll() {
    return this.studentRepository.find();
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: number, student: Student) {
    const existingStudent = await this.findOne(id);
    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    
    await this.studentRepository.update(id, student);
    return this.findOne(id);
  }

  async remove(id: number) {
    const student = await this.findOne(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    
    await this.studentRepository.delete(id);
    return { message: `Student with ID ${id} has been deleted` };
  }
}