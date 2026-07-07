import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { HashPasswordUtils } from '@shared/utils/hash-password.utils';
import { UserValidator } from '../validators/user.validator';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto, CreatorProfileDto } from '../dtos/user.dtos';
import { ProfileService } from '@modules/profile/services/profile.service';
import { UserRole } from '@shared/enums/user-role.enum';
import { UserQueryService } from './user-query.service';

@Injectable()
export class UserService {
    private readonly validator = new UserValidator();

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly profileService: ProfileService,
        private readonly userQueryService: UserQueryService,
    ) { }

    async register(data: RegisterUserDto): Promise<{ token: string }> {
        this.validator.validateCreateUser(data);

        const usernameExists = await this.checkUsernameExists(data.username);
        if (usernameExists) {
            throw new BadRequestException('O nome de utilizador já está a ser usado');
        }

        const whereConditions: any[] = [];
        if (data.email) whereConditions.push({ email: data.email });
        if (data.phoneNumber) whereConditions.push({ phoneNumber: data.phoneNumber });

        if (whereConditions.length > 0) {
            const existing = await this.userRepository.findOne({ where: whereConditions });
            if (existing) {
                throw new BadRequestException('E-mail ou número de telefone já cadastrado');
            }
        }

        const hashedPassword = data.password ? await HashPasswordUtils.hash(data.password) : null;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = queryRunner.manager.create(User, {
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: hashedPassword,
                role: data.role,
            });

            const savedUser = await queryRunner.manager.save(User, user);

            await this.profileService.createProfile(
                savedUser,
                {
                    fullName: data.fullName,
                    birthDate: data.birthDate,
                },
                queryRunner.manager
            );

            await queryRunner.commitTransaction();

            const token = this.jwtService.sign({
                sub: savedUser.id,
                role: savedUser.role,
            });

            return { token };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createFromGoogle(profile: any): Promise<User> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const email = profile.emails[0].value;

            const existingUser = await queryRunner.manager.findOne(User, {
                where: { email },
                withDeleted: true,
            });

            if (existingUser) {
                if (existingUser.isDeleted) {
                    existingUser.isDeleted = false;
                    existingUser.deletedAt = null;
                    await queryRunner.manager.save(User, existingUser);
                    await queryRunner.commitTransaction();
                    return await this.userQueryService.findByIdWithProfile(existingUser.id);
                }

                await queryRunner.commitTransaction();
                return await this.userQueryService.findByIdWithProfile(existingUser.id);
            }

            const baseUsername = email.split('@')[0];
            const uniqueUsername = `${baseUsername}_${Date.now()}`;

            const user = queryRunner.manager.create(User, {
                username: uniqueUsername,
                email,
                phoneNumber: null,
                password: null,
                role: UserRole.USER,
                provider: 'google',
                googleId: profile.id,
            });

            const savedUser = await queryRunner.manager.save(User, user);

            await this.profileService.createFromGoogle(savedUser.id, profile, queryRunner.manager);

            await queryRunner.commitTransaction();

            return await this.userQueryService.findByIdWithProfile(savedUser.id);
        } catch (err: any) {
            await queryRunner.rollbackTransaction();
            console.log({
                msg: 'Failed to create user from Google',
                action: 'USER_CREATE_GOOGLE_ERROR',
                service: 'User',
                error: err?.message || err,
                data: { googleId: profile.id },
            });
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    async reactivateUserIfDeleted(user: User): Promise<User> {
        user.isDeleted = false;
        user.deletedAt = null;
        return await this.userRepository.save(user);
    }

    async checkUsernameExists(username: string): Promise<boolean> {
        if (!username) {
            throw new BadRequestException('O nome de utilizador é obrigatório');
        }
        const count = await this.userRepository.count({ where: { username } });
        return count > 0;
    }

    async convertToCreator(userId: number): Promise<{ token: string }> {
        const user = await this.userQueryService.getById(userId);

        if (user.role !== UserRole.USER) {
            throw new BadRequestException('Apenas utilizadores com o tipo de conta padrão podem tornar-se criadores');
        }

        user.role = UserRole.CREATOR;
        const updatedUser = await this.userRepository.save(user);

        const token = this.jwtService.sign({
            sub: updatedUser.id,
            role: updatedUser.role,
        });

        return { token };
    }

    async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password']
        });

        if (!user || !user.password) {
            throw new NotFoundException('Lamentamos, mas não encontramos a sua conta');
        }

        const isPasswordValid = await HashPasswordUtils.compare(data.oldPassword, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('A senha antiga está incorreta');
        }

        user.password = await HashPasswordUtils.hash(data.newPassword);
        await this.userRepository.save(user);
    }
}