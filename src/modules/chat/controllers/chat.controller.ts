import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { Public } from '@modules/auth-guard/decorators/public.decorator';
import { UserDecorator } from '@modules/auth-guard/decorators/user.decorator';

@Controller('chat-messages')
export class ChatMessageController {
    constructor(private readonly chatService: ChatService) { }

    @Get('live/:liveId')
    @Public()
    async getMessages(@Param('liveId', ParseUUIDPipe) liveId: string) {
        return this.chatService.getLiveMessages(liveId);
    }

    @Get('private')
    async getPrivateMessages(
        @UserDecorator('sub') userId: number,
        @Query('username') username: string,
    ) {
        return this.chatService.getPrivateMessages(userId, username);
    }

    @Get('conversations')
    async getConversations(@UserDecorator('sub') userId: number) {
        return this.chatService.getUserConversations(userId);
    }
}