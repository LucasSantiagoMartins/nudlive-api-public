import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaUser } from '../entities/media-user.entity';
import { UserCreatedEvent, UserUpdatedEvent } from '@nudlive/events';

@Injectable()
export class MediaUserService {
    constructor(
        @InjectRepository(MediaUser)
        private readonly mediaUserRepository: Repository<MediaUser>,
    ) { }

    async create(data: UserCreatedEvent): Promise<MediaUser> {
        const user = this.mediaUserRepository.create({
            id: data.userId,
            username: data.username,
            fullName: data.fullName,
            role: data.role,
        });
        return this.mediaUserRepository.save(user);
    }

    async update(userId: number, data: UserUpdatedEvent): Promise<MediaUser | null> {
        const user = await this.mediaUserRepository.preload({
            id: userId,
            ...data,
        });
        if (!user) {
            return null;
        }
        return this.mediaUserRepository.save(user);
    }
}