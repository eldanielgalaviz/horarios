import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { Teacher } from '../entities/teacher.entity';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() teacher: Teacher) {
    return this.teacherService.create(teacher);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() teacher: Teacher) {
    return this.teacherService.update(+id, teacher);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(+id);
  }
}