import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveController } from './controllers/live.controller';
import { LiveService } from './services/live.service';
import { LiveGateway } from './gateways/live.gateway';
import { Live } from './entities/live.entity';
import { ChatModule } from '../chat/chat.module';
import { PresenceModule } from '../presence/presence.module';
import { LiveQueryService } from './services/live-query.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Live]),
    ChatModule,
    PresenceModule,
  ],
  controllers: [LiveController],
  providers: [LiveService, LiveQueryService, LiveGateway],
})
export class LiveModule { }