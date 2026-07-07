import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatUser } from 'apps/real-time-service/src/modules/chat-user/entities/chat-user.entity';
import { UserCreatedEvent, UserUpdatedEvent } from '@nudlive/events';

@Injectable()
export class ChatUserService {
    constructor(
        @InjectRepository(ChatUser)
        private readonly chatUserRepository: Repository<ChatUser>,
    ) { }

    async create(data: UserCreatedEvent): Promise<ChatUser> {
        const user = this.chatUserRepository.create({
            id: data.userId,
            username: data.username,
            fullName: data.fullName,
            role: data.role,
        });
        return this.chatUserRepository.save(user);
    }

    async update(userId: number, data: UserUpdatedEvent): Promise<ChatUser | null> {
        const user = await this.chatUserRepository.preload({
            id: userId,
            ...data,
        });
        if (!user) {
            return null;
        }
        return this.chatUserRepository.save(user);
    }
}