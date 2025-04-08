import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'correo',
      passwordField: 'contraseña',
      passReqToCallback: true, // Importante: permite pasar el request al método validate
    });
  }

  async validate(req: Request, correo: string, contraseña: string): Promise<any> {
    // Extraer userType del cuerpo de la solicitud
    const { userType } = req.body;
    
    if (!userType) {
      throw new UnauthorizedException('Se requiere el tipo de usuario');
    }
    
    const user = await this.authService.validateUser(correo, contraseña, userType);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    return user;
  }
}