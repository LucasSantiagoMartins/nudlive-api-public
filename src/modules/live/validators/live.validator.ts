import { BadRequestException } from '@nestjs/common';
import { CreateLiveDto } from '../dtos/create-live.dto';

export class LiveValidator {
  validateCreate(data: CreateLiveDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new BadRequestException('O título da live é obrigatório');
    }
  }
}