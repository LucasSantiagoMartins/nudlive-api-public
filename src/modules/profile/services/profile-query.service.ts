import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { ProfileResponseDto } from '../dtos/profile-response.dto';

@Injectable()
export class ProfileQueryService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    async findById(id: number): Promise<Profile | null> {
        return await this.profileRepository.findOne({ where: { id } });
    }

    async findByUserId(userId: number): Promise<Profile | null> {
        return await this.profileRepository.findOne({ where: { user: { id: userId } } });
    }

    async getByUserId(userId: number): Promise<Profile> {
        const profile = await this.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Lamentamos, mas não conseguimos encontrar as informações do seu perfil');
        }
        return profile;
    }

    async getMe(userId: number) {
        const profile = await this.profileRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        return ProfileResponseDto.fromEntity(profile);

    }
}