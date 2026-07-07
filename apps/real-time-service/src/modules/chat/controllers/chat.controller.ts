import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from '../services/chat-service.service';
import { ChatMessageResponseDto } from '../dtos/chat-message-response.dto';
import { ChatSummaryResponseDto } from '../dtos/chat-summary-response.dto';
import { UserDecorator } from '@nudlive/auth';

@Controller('chat-messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('conversations')
  async getUserConversations(@UserDecorator('sub') userId: number): Promise<ChatSummaryResponseDto[]> {
    return this.chatService.getUserConversations(userId);
  }
  
  @Get('private')
  async getPrivateMessages(
    @UserDecorator('sub') userId: number,
    @Query('username') username: string,
  ): Promise<ChatMessageResponseDto[]> {
    return this.chatService.getPrivateMessages(userId, username);
  }
}