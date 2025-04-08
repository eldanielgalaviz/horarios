// src/grupo/grupo.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { Grupo } from '../entities/grupo.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createGrupoDto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.create(createGrupoDto);
  }

  @Get()
  @Public() // Permitir acceso público a la lista de grupos
  findAll(): Promise<Grupo[]> {
    return this.grupoService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MAESTRO, Role.ALUMNO, Role.CHECADOR)
  findOne(@Param('id') id: number): Promise<Grupo> {
    return this.grupoService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: number, @Body() updateGrupoDto: CreateGrupoDto): Promise<Grupo> {
    return this.grupoService.update(id, updateGrupoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.grupoService.remove(id);
  }
}