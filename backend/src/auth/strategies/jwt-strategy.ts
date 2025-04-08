import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    // Obtener el secreto antes de pasarlo al constructor
    const secretKey = configService.get<string>('JWT_SECRET') || 'desarrollo_secreto_temporal';
    
    if (!secretKey) {
      throw new Error('JWT_SECRET no está definido en la configuración');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) {
    // Añadir el userType al objeto de usuario que será inyectado en la solicitud
    return {
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
    };
  }
}
