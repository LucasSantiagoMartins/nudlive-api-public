import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatMessageResponseDto } from '../dtos/chat-message-response.dto';
import { ChatSummaryResponseDto } from '../dtos/chat-summary-response.dto';
import { ChatUser } from 'apps/real-time-service/src/modules/chat-user/entities/chat-user.entity';
import { KafkaService } from '@nudlive/kafka';
import { LiveMessageCreatedEvent } from '@nudlive/events/domains/chat/live-message-created.event';
import { EventTopics } from '@nudlive/events';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatMessage)
        private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(ChatUser)
        private readonly chatUserRepository: Repository<ChatUser>,
        private readonly kafkaService: KafkaService,
    ) { }

    async saveLiveMessage(
        liveId: string,
        userId: number,
        message: string,
    ): Promise<ChatMessage> {
        if (!message || message.trim().length === 0) {
            throw new BadRequestException('A mensagem não pode estar vazia');
        }

        const chatMessage = this.chatMessageRepository.create({
            liveId,
            userId,
            message,
        });

        const savedMessage = await this.chatMessageRepository.save(chatMessage);

        const completeMessage = await this.chatMessageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['user'],
        });

        await this.kafkaService.publish(
            EventTopics.LIVE_MESSAGE_CREATED,
            completeMessage.id,
            'LiveMessageCreatedEvent',
            new LiveMessageCreatedEvent(
                completeMessage.id,
                completeMessage.liveId,
                completeMessage.userId,
                completeMessage.user.username,
                completeMessage.user.profilePhotoUrl,
                completeMessage.user.fullName,
                completeMessage.message,
                completeMessage.createdAt,
            ),
        );

        return completeMessage;
    }

    async savePrivateMessage(senderId: number, receiverId: number, message: string): Promise<ChatMessage> {
        if (!message || message.trim().length === 0) {
            throw new BadRequestException('A mensagem não pode estar vazia');
        }

        const chatMessage = this.chatMessageRepository.create({
            userId: senderId,
            receiverId,
            message,
        });

        const savedMessage = await this.chatMessageRepository.save(chatMessage);

        return this.chatMessageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['user', 'receiver'],
        });
    }

    async getLiveMessages(liveId: string): Promise<ChatMessageResponseDto[]> {
        const messages = await this.chatMessageRepository.find({
            where: { liveId },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });

        return messages.map((message) => ChatMessageResponseDto.fromEntity(message));
    }

    async getPrivateMessages(
        senderId: number,
        receiverUsername: string,
    ): Promise<ChatMessageResponseDto[]> {
        const receiver = await this.chatUserRepository.findOne({
            where: { username: receiverUsername },
        });

        if (!receiver) {
            throw new NotFoundException('Usuário destinatário não encontrado');
        }

        const messages = await this.chatMessageRepository.find({
            where: [
                {
                    userId: senderId,
                    receiverId: receiver.id,
                },
                {
                    userId: receiver.id,
                    receiverId: senderId,
                },
            ],
            relations: ['user', 'receiver'],
            order: {
                createdAt: 'ASC',
            },
        });

        return messages.map((message) => ChatMessageResponseDto.fromEntity(message));
    }

    async getUserConversations(userId: number): Promise<ChatSummaryResponseDto[]> {
        const subQuery = this.chatMessageRepository
            .createQueryBuilder('msg')
            .select('MAX(msg.createdAt)', 'maxDate')
            .where('msg.liveId IS NULL')
            .andWhere('(msg.userId = :userId OR msg.receiverId = :userId)')
            .groupBy(
                `CASE 
          WHEN msg.userId = :userId THEN msg.receiverId 
          ELSE msg.userId 
         END`,
            );

        const latestMessages = await this.chatMessageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.user', 'user')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('message.createdAt IN (' + subQuery.getQuery() + ')')
            .setParameters({ userId })
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        return latestMessages.map((message) =>
            ChatSummaryResponseDto.fromEntity(message, userId),
        );
    }
}