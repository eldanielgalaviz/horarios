import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Verificar si ya existe un admin con el mismo correo
    const existingAdmin = await this.adminRepository.findOne({ 
      where: { Correo: createAdminDto.Correo } 
    });
    
    if (existingAdmin) {
      throw new ConflictException('Ya existe un administrador con este correo');
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createAdminDto.Contraseña, 10);
    
    // Crear el nuevo administrador
    const admin = this.adminRepository.create({
      ...createAdminDto,
      Contraseña: hashedPassword,
    });
    
    return this.adminRepository.save(admin);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find();
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ 
      where: { ID: id } 
    });
    
    if (!admin) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }
    
    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ 
      where: { Correo: email } 
    });
  }

  async update(id: number, updateAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);
    
    // Si se está actualizando el correo, verificar que no exista otro admin con ese correo
    if (updateAdminDto.Correo !== admin.Correo) {
      const existingAdmin = await this.adminRepository.findOne({ 
        where: { Correo: updateAdminDto.Correo } 
      });
      
      if (existingAdmin && existingAdmin.ID !== id) {
        throw new ConflictException('Ya existe un administrador con este correo');
      }
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (updateAdminDto.Contraseña) {
      updateAdminDto.Contraseña = await bcrypt.hash(updateAdminDto.Contraseña, 10);
    }
    
    this.adminRepository.merge(admin, updateAdminDto);
    return this.adminRepository.save(admin);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }
  }
}
