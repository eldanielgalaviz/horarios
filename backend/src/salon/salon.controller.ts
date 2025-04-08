import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { SalonService } from './salon.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { Salon } from '../entities/salon.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('salones')
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSalonDto: CreateSalonDto): Promise<Salon> {
    return this.salonService.create(createSalonDto);
  }

  @Get()
  findAll(): Promise<Salon[]> {
    return this.salonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Salon> {
    return this.salonService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() updateSalonDto: CreateSalonDto): Promise<Salon> {
    return this.salonService.update(id, updateSalonDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.salonService.remove(id);
  }
}