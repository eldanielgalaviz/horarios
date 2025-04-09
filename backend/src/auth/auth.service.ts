import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AlumnoService } from '../alumno/alumno.service';
import { MaestroService } from '../maestro/maestro.service';
import { ChecadorService } from '../checador/checador.service';
import { AdminService } from '../admin/admin.service';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private alumnoService: AlumnoService,
    private maestroService: MaestroService,
    private checadorService: ChecadorService,
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string, userType: string): Promise<any> {
    let user;

    switch (userType) {
      case Role.ALUMNO:
        user = await this.alumnoService.findByEmail(email);
        break;
      case Role.MAESTRO:
        user = await this.maestroService.findByEmail(email);
        break;
      case Role.CHECADOR:
        user = await this.checadorService.findByEmail(email);
        break;
      case Role.ADMIN:
        user = await this.adminService.findByEmail(email);
        break;
      default:
        throw new UnauthorizedException('Tipo de usuario inválido');
    }

    if (user && await bcrypt.compare(password, user.Contraseña)) {
      const { Contraseña, ...result } = user;
      return {
        ...result,
        userType,
      };
    }
    return null;
  }

  async login(user: any) {
    let userId;
    
    // Determinar el ID basado en el tipo de usuario
    switch (user.userType) {
      case Role.ALUMNO:
        userId = user.ID_Alumno;
        break;
      case Role.MAESTRO:
        userId = user.ID_Maestro;
        break;
      case Role.CHECADOR:
      case Role.ADMIN:
        userId = user.ID;
        break;
    }
    
    const payload = {
      sub: userId,
      email: user.Correo,
      userType: user.userType,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        nombre: user.Nombre,
        correo: user.Correo,
        userType: user.userType,
      },
    };
  }

  // Método para registrar nuevo usuario (utilizado por TeacherService)
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // La implementación depende de qué tipo de usuario se está registrando
    // Aquí adaptamos según el rol
    switch (userData.role) {
      case Role.ADMIN:
        return this.adminService.create({
          Nombre: userData.name,
          Correo: userData.email,
          Contraseña: hashedPassword
        });
      case Role.MAESTRO:
        return this.maestroService.create({
          Nombre: userData.name,
          Correo: userData.email,
          Contraseña: hashedPassword
        });
      case Role.ALUMNO:
        // En caso de alumnos necesitaríamos el Grupo_ID
        throw new Error('Para registrar alumnos es necesario el Grupo_ID');
      case Role.CHECADOR:
        return this.checadorService.create({
          Correo: userData.email,
          Contraseña: hashedPassword
        });
      default:
        throw new Error(`Rol desconocido para registro: ${userData.role}`);
    }
  }

  // Método para actualizar un usuario existente
  async updateUser(email: string, userData: {
    email?: string;
    name?: string;
    password?: string;
  }) {
    // Primero intentamos encontrar qué tipo de usuario es
    let user = await this.findUserByEmail(email);
    
    if (!user) {
      throw new Error(`No se encontró usuario con el email: ${email}`);
    }
    
    // Preparamos los datos a actualizar (siguiendo la estructura de nuestras entidades)
    const updateData: any = {};
    if (userData.name) updateData.Nombre = userData.name;
    if (userData.email) updateData.Correo = userData.email;
    if (userData.password) updateData.Contraseña = await bcrypt.hash(userData.password, 10);
    
    // Actualizamos según el tipo de usuario
    switch (user.userType) {
      case Role.ADMIN:
        return this.adminService.update(user.id, updateData);
      case Role.MAESTRO:
        return this.maestroService.update(user.id, updateData);
      case Role.ALUMNO:
        return this.alumnoService.update(user.id, updateData);
      case Role.CHECADOR:
        return this.checadorService.update(user.id, updateData);
      default:
        throw new Error(`Tipo de usuario no soportado: ${user.userType}`);
    }
  }

  // Método para eliminar un usuario
  async deleteUser(email: string): Promise<void> {
    // Primero intentamos encontrar qué tipo de usuario es
    let user = await this.findUserByEmail(email);
    
    if (!user) {
      throw new Error(`No se encontró usuario con el email: ${email}`);
    }
    
    // Eliminamos según el tipo de usuario
    switch (user.userType) {
      case Role.ADMIN:
        await this.adminService.remove(user.id);
        break;
      case Role.MAESTRO:
        await this.maestroService.remove(user.id);
        break;
      case Role.ALUMNO:
        await this.alumnoService.remove(user.id);
        break;
      case Role.CHECADOR:
        await this.checadorService.remove(user.id);
        break;
      default:
        throw new Error(`Tipo de usuario no soportado: ${user.userType}`);
    }
  }

  // Método auxiliar para encontrar un usuario por email
  private async findUserByEmail(email: string): Promise<{ id: number, userType: string } | null> {
    // Intentar encontrar en cada servicio
    const admin = await this.adminService.findByEmail(email);
    if (admin) return { id: admin.ID, userType: Role.ADMIN };
    
    const maestro = await this.maestroService.findByEmail(email);
    if (maestro) return { id: maestro.ID_Maestro, userType: Role.MAESTRO };
    
    const alumno = await this.alumnoService.findByEmail(email);
    if (alumno) return { id: alumno.ID_Alumno, userType: Role.ALUMNO };
    
    const checador = await this.checadorService.findByEmail(email);
    if (checador) return { id: checador.ID, userType: Role.CHECADOR };
    
    return null;
  }
}