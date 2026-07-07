import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatMessageResponseDto } from '../dtos/chat-message-response.dto';
import { UserQueryService } from '@modules/user/services/user-query.service';
import { ChatSummaryResponseDto } from '../dtos/chat-summary-response.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly userQueryService: UserQueryService,
  ) { }

  async saveLiveMessage(liveId: string, userId: number, message: string): Promise<ChatMessage> {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('A mensagem não pode estar vazia');
    }

    const chatMessage = this.chatMessageRepository.create({
      liveId,
      userId,
      message,
    });

    const savedMessage = await this.chatMessageRepository.save(chatMessage);

    return this.chatMessageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['user', 'user.profile'],
    });
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
      relations: ['user', 'user.profile', 'receiver', 'receiver.profile'],
    });
  }

  async getLiveMessages(liveId: string): Promise<ChatMessageResponseDto[]> {
    const messages = await this.chatMessageRepository.find({
      where: { liveId },
      relations: ['user', 'user.profile'],
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => ChatMessageResponseDto.fromEntity(message));
  }

  async getPrivateMessages(
    senderId: number,
    receiverUsername: string,
  ): Promise<ChatMessageResponseDto[]> {
    const receiver = await this.userQueryService.find({
      username: receiverUsername,
    });

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
      relations: [
        'user',
        'user.profile',
        'receiver',
        'receiver.profile',
      ],
      order: {
        createdAt: 'ASC',
      },
    });

    return messages.map((message) =>
      ChatMessageResponseDto.fromEntity(message),
    );
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
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('receiver.profile', 'receiverProfile')
      .where('message.createdAt IN (' + subQuery.getQuery() + ')')
      .setParameters({ userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    return latestMessages.map((message) =>
      ChatSummaryResponseDto.fromEntity(message, userId),
    );
  }
}