import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GrupoModule } from './grupo/grupo.module';
import { AlumnoModule } from './alumno/alumno.module';
import { MaestroModule } from './maestro/maestro.module';
import { ChecadorModule } from './checador/checador.module';
import { SalonModule } from './salon/salon.module';
import { MateriaModule } from './materia/materia.module';
import { HorarioModule } from './horario/horario.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'admin'),
        database: configService.get('DB_NAME', 'horarios_escolares'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    GrupoModule,
    AlumnoModule,
    MaestroModule,
    ChecadorModule,
    SalonModule,
    MateriaModule,
    HorarioModule,
    AsistenciaModule,
    AdminModule,
    AuthModule,
  ],
  providers: [
    // Aplicar JwtAuthGuard globalmente (excepto rutas con @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Aplicar RolesGuard globalmente
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
