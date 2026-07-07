import { IsNotEmpty, IsString, IsOptional, IsUrl, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { LiveCategory } from '../enums/live-status.enum';

export class CreateLiveDto {
  @IsNotEmpty({ message: 'O título da live é obrigatório' })
  @IsString({ message: 'Título inválido' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Descrição inválida' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link da imagem de capa inválido' })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString({ message: 'Categoria inválida' })
  category?: LiveCategory;

  @IsNotEmpty({ message: 'O agendamento da live é obrigatório' })
  @Type(() => Date)
  @IsDate({ message: 'O agendamento deve conter uma data e hora válidas' })
  scheduledAt: Date;
}