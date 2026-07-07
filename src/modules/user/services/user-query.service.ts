import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreatorProfileDto } from '../dtos/user.dtos';
import { UserRole } from '@shared/enums/user-role.enum';

@Injectable()
export class UserQueryService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async find(where: { username?: string, id?: number }): Promise<User | null> {
        return await this.userRepository.findOne({ where });
    }


    async getById(id: number): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Lamentamos, mas não encontramos a sua conta');
        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: { email, },
            select: {
                id: true,
                password: true,
                role: true,
            },
        });
    }

    async findByPhone(phoneNumber: string): Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: { phoneNumber },
            select: {
                id: true,
                password: true,
                role: true,
            }
        });
    }

      async findByIdWithProfile(id: number): Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['profile'],
        });
    }

    async getCreatorByUsername(
        username: string,
        currentUserId?: number,
    ): Promise<CreatorProfileDto> {

        if (!username) {
            return null;
        }

        const creator = await this.userRepository.findOne({
            where: {
                username,
                role: UserRole.CREATOR,
            },
            relations: ['profile'],
        });

        if (!creator) {
            return null;
        }

        let isFollowing = false;

        if (currentUserId) {

            const follower = await this.userRepository.findOne({
                where: { id: currentUserId },
                relations: [
                    'profile',
                    'profile.following',
                ],
            });

            isFollowing =
                follower?.profile.following.some(
                    p => { p.id === creator.profile.id }
                ) ?? false;
        }

        return CreatorProfileDto.fromEntity(
            creator,
            isFollowing,
        );
    }

    async getUserIdByPhone(phoneNumber: string): Promise<number | undefined> {
        const user = await this.userRepository.findOne({
            where: { phoneNumber },
            select: { id: true }
        });
        return user?.id;
    }

}