import { TypeOrmModule } from '@nestjs/typeorm';
import { PresenceService } from './services/presence.service';
import { Viewer } from './entities/viewer.entity';
import { Module } from '@nestjs/common';
import { RedisModule } from '@nudlive/common/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Viewer]), RedisModule],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule { }