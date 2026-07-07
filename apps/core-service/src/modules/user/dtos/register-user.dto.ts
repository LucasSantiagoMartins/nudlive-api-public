import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from "@nudlive/common/enums/user-role.enum";

export class RegisterUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'O formato do e-mail informado é inválido' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Número de telefone inválido' })
    phoneNumber?: string;

    @IsOptional()
    @IsString({ message: 'A senha deve ser uma sequência de caracteres válida' })
    password?: string;

    @IsNotEmpty({ message: 'O nome de usuário é obrigatório' })
    @IsString({ message: 'O nome de usuário deve ser uma sequência de caracteres válida' })
    username: string;

    @IsNotEmpty({ message: 'O tipo de conta é obrigatória' })
    @IsEnum(UserRole, { message: 'Tipo de conta informado não é válido' })
    role: UserRole;

    @IsNotEmpty({ message: 'O nome completo é obrigatório' })
    @IsString({ message: 'Nome completo inválido' })
    fullName: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'A data de nascimento informada deve ser uma data válida' })
    birthDate?: Date;
}