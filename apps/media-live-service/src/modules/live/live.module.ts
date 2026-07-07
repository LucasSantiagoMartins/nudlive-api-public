import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Live } from './entities/live.entity';
import { LiveService } from './services/live.service';
import { LiveQueryService } from './services/live-query.service';
import { LiveController } from './controllers/live.controller';
import { MediaUserModule } from '../media-user/media-user.module';
import { LiveGateway } from './gateways/live.gateway';
import { PresenceModule } from '../presence/presence.module';
import { LiveMessageCreatedConsumer } from './consumers/live-message-created.consumer';
import { LiveKitService } from './services/livekit.service';

@Module({
    imports: [TypeOrmModule.forFeature([Live]), MediaUserModule, PresenceModule],
    controllers: [LiveController],
    providers: [LiveService, LiveQueryService, LiveKitService, LiveGateway, LiveMessageCreatedConsumer],
})
export class LiveModule { }