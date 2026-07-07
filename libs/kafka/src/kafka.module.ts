import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KafkaService } from './kafka.service';
import { KAFKA_CLIENT } from './kafka.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KAFKA_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const broker = configService.get<string>('KAFKA_BROKER') || 'kafka:9092';
        const clientId = configService.get<string>('KAFKA_CLIENT_ID') || 'nudlive';
        return new Kafka({
          clientId,
          brokers: [broker],
        });
      },
    },
    KafkaService,
  ],
  exports: [KafkaService],
})
export class KafkaModule {}