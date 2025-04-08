import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException('Fecha no proporcionada');
    }
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Formato de fecha inválido: ${value}`);
    }
    
    return date;
  }
}