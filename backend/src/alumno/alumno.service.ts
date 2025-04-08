import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { GrupoService } from '../grupo/grupo.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
    private grupoService: GrupoService,
  ) {}

  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    // Verificar si ya existe un alumno con el mismo correo
    const existingAlumno = await this.alumnoRepository.findOne({ 
      where: { Correo: createAlumnoDto.Correo } 
    });
    
    if (existingAlumno) {
      throw new ConflictException('Ya existe un alumno con este correo');
    }

    // Verificar si el grupo existe
    const grupo = await this.grupoService.findOne(createAlumnoDto.Grupo_ID);
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createAlumnoDto.Contraseña, 10);
    
    // Crear el nuevo alumno
    const alumno = this.alumnoRepository.create({
      ...createAlumnoDto,
      Contraseña: hashedPassword,
      Grupo: grupo,
    });
    
    return this.alumnoRepository.save(alumno);
  }

  async findAll(): Promise<Alumno[]> {
    return this.alumnoRepository.find({ 
      relations: ['Grupo'] 
    });
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({ 
      where: { ID_Alumno: id }, 
      relations: ['Grupo'] 
    });
    
    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }
    
    return alumno;
  }

  async findByEmail(email: string): Promise<Alumno | null> {
    return this.alumnoRepository.findOne({ 
      where: { Correo: email } 
    });
  }

  async update(id: number, updateAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findOne(id);
    
    // Si se está actualizando el correo, verificar que no exista otro alumno con ese correo
    if (updateAlumnoDto.Correo !== alumno.Correo) {
      const existingAlumno = await this.alumnoRepository.findOne({ 
        where: { Correo: updateAlumnoDto.Correo } 
      });
      
      if (existingAlumno && existingAlumno.ID_Alumno !== id) {
        throw new ConflictException('Ya existe un alumno con este correo');
      }
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (updateAlumnoDto.Contraseña) {
      updateAlumnoDto.Contraseña = await bcrypt.hash(updateAlumnoDto.Contraseña, 10);
    }
    
    // Si se está actualizando el grupo, verificar que exista
    if (updateAlumnoDto.Grupo_ID) {
      const grupo = await this.grupoService.findOne(updateAlumnoDto.Grupo_ID);
      alumno.Grupo = grupo;
    }
    
    this.alumnoRepository.merge(alumno, updateAlumnoDto);
    return this.alumnoRepository.save(alumno);
  }

  async remove(id: number): Promise<void> {
    const result = await this.alumnoRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }
  }
}
