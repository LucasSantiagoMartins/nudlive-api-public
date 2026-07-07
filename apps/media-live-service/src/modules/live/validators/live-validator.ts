import { BadRequestException } from '@nestjs/common';
import { CreateLiveDto } from '../dtos/create-live.dto';
import { LiveCategory } from '../enums/live-status.enum';

export class LiveValidator {
    validateCreate(data: CreateLiveDto): void {
        if (!data.title || data.title.trim().length === 0) {
            throw new BadRequestException('O título da live é obrigatório');
        }
        if(data.category && !Object.values(LiveCategory).includes(data.category))
        {
            throw new BadRequestException("Esta categoria de live não existe")
        }
    }
}