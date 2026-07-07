import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './services/chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatMessageController } from './controllers/chat.controller';
import { PrivateChatGateway } from './gateways/private-chat.gateway';
import { UserModule } from '@modules/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([ChatMessage]), UserModule],
    controllers: [ChatMessageController],
    providers: [ChatService, PrivateChatGateway],
    exports: [ChatService],
})
export class ChatModule { }