import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'A senha antiga é obrigatória' })
    @IsString({ message: 'Senha antiga informada é inválida' })
    oldPassword: string;

    @IsNotEmpty({ message: 'A nova senha é obrigatória' })
    @IsString({ message: 'Nova senha informada inválida' })
    newPassword: string;
}