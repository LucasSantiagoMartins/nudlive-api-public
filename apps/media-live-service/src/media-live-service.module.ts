import { Module } from '@nestjs/common';
import { KafkaModule } from '@nudlive/kafka';
import { CommonModule } from '@nudlive/common';
import { JwtAuthModule } from '@nudlive/auth';
import { MediaUserModule } from './modules/media-user/media-user.module';
import { LiveModule } from './modules/live/live.module';

@Module({
  imports: [
    CommonModule.register(),
    KafkaModule,
    JwtAuthModule,
    MediaUserModule,
    LiveModule,
  ],
})
export class AppModule { }