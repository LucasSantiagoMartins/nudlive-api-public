import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreatePresignedUploadDto {
  @IsNotEmpty({ message: 'A pasta de destino é obrigatória' })
  @IsString({ message: 'Pasta inválida' })
  folder: string;

  @IsNotEmpty({ message: 'O tipo de arquivo é obrigatório' })
  @IsString({ message: 'Tipo de arquivo inválido' })
  fileType: string;


  @IsNotEmpty({ message: 'O tamanho do arquivo é obrigatório' })
  @IsNumber({}, { message: 'O tamanho do arquivo deve ser um número válido' })
  @IsPositive({ message: 'O tamanho do arquivo deve ser maior do que zero' })
  size: number;
}