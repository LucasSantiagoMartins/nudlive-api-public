import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './services/chat-service.service';
import { ChatController } from './controllers/chat.controller';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { LiveMessageConsumer } from './consumers/live-message.consumer';
import { LiveChatController } from './controllers/live-chat.controller';
import { PrivateChatGateway } from './gateways/private-chat.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatMessage]),
        ChatUserModule,
    ],
    controllers: [ChatController, LiveChatController],
    providers: [ChatService, LiveMessageConsumer, PrivateChatGateway],
    exports: [ChatService],
})
export class ChatModule { }