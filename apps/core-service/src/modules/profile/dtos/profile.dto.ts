import { IsNotEmpty, IsString, IsOptional, IsDate, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class InternalCreateProfileDto {
    fullName: string;
    birthDate?: Date;
}


export class UpdateProfileDto {
    @IsOptional()
    @IsString({ message: 'Nome completo inválido' })
    fullName?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'A data de nascimento informada deve ser uma data válida' })
    birthDate?: Date;

    @IsOptional()
    @IsString({ message: 'Biografia inválida' })
    bio?: string;

    @IsOptional()
    @IsString({ message: 'Localização inválida' })
    location?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link da foto de perfil inválido' })
    profilePhotoUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link do banner inválido' })
    bannerUrl?: string;
}
