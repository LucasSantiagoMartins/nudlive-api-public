import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaUser } from './entities/media-user.entity';
import { MediaUserConsumer } from './consumers/media-user.consumer';
import { MediaUserService } from './services/media-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaUser])],
  providers: [MediaUserConsumer, MediaUserService],
  exports: [TypeOrmModule],
})
export class MediaUserModule {}