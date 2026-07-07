import { TypeOrmModule } from '@nestjs/typeorm';
import { PresenceService } from './services/presence.service';
import { Viewer } from './entities/viewer.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Viewer])],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}