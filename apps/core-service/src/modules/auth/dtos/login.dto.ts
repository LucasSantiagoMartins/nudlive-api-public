import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'E-mail ou telefone é obrigatório' })
  @IsString({ message: 'E-mail ou telefone informado inválido' })
  identifier: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString({ message: 'Senha informada inválida' })
  password: string;
}