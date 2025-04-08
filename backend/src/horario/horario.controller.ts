import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { Horario } from '../entities/horario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('horarios')
export class HorarioController {
  constructor(private readonly horarioService: HorarioService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createHorarioDto: CreateHorarioDto): Promise<Horario> {
    return this.horarioService.create(createHorarioDto);
  }

  @Get()
  findAll(): Promise<Horario[]> {
    return this.horarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Horario> {
    return this.horarioService.findOne(id);
  }
  
  @Get('grupo/:id')
  findByGrupo(@Param('id') id: number): Promise<Horario[]> {
    return this.horarioService.findByGrupo(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() updateHorarioDto: CreateHorarioDto): Promise<Horario> {
    return this.horarioService.update(id, updateHorarioDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.horarioService.remove(id);
  }
}
