import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from '../services/chat-service.service';
import { ChatMessageResponseDto } from '../dtos/chat-message-response.dto';
import { Public } from '@nudlive/auth';

@Controller('live-chats')
export class LiveChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get(':liveId/messages')
    @Public()
    async getLiveMessages(@Param('liveId') liveId: string): Promise<ChatMessageResponseDto[]> {
        return this.chatService.getLiveMessages(liveId);
    }
}