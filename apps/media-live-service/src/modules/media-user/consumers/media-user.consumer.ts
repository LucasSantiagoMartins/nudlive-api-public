import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '@nudlive/kafka';
import { EventTopics } from '@nudlive/events';
import { MediaUserService } from '../services/media-user.service';

@Injectable()
export class MediaUserConsumer implements OnModuleInit {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly mediaUserService: MediaUserService,
    ) {}

    async onModuleInit() {
        await this.kafkaService.createConsumer(
            'media-live-user-group',
            [EventTopics.USER_CREATED, EventTopics.USER_UPDATED],
            async (event) => {
                if (event.eventName === 'UserCreatedEvent') {
                    await this.mediaUserService.create(event.data);
                }
                if (event.eventName === 'UserUpdatedEvent') {
                    await this.mediaUserService.update(event.data.userId, event.data);
                }
            },
        );
    }
}