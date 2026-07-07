import { UserRole } from '@shared/enums/user-role.enum';

export interface RegisterUserDto {
    email?: string;
    phoneNumber?: string;
    password?: string;
    username: string;
    role: UserRole;
    fullName: string;
    birthDate?: Date;
}