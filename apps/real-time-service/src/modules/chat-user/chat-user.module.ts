import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUserConsumer } from './consumers/chat-user.consumer';
import { ChatUser } from './entities/chat-user.entity';
import { ChatUserService } from './services/chat-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUser])],
  providers: [ChatUserConsumer, ChatUserService],
  exports: [TypeOrmModule],
})
export class ChatUserModule {}