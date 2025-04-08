import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance } from './attendance.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  markAttendance(@Body() attendance: Attendance) {
    return this.attendanceService.markAttendance(attendance);
  }

  @Get()
  getAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() attendance: Attendance) {
    return this.attendanceService.update(+id, attendance);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}