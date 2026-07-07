import { Module } from '@nestjs/common';
import { KafkaModule } from '@nudlive/kafka';
import { CommonModule } from '@nudlive/common';
import { JwtAuthModule } from '@nudlive/auth';
import { ChatUserModule } from './src/modules/chat-user/chat-user.module';
import { ChatModule } from './src/modules/chat/chat.module';

@Module({
    imports: [
        CommonModule.register(),

        ChatUserModule,
        JwtAuthModule,

        KafkaModule,
        ChatModule,
    ],
})
export class RealTimeModule { }