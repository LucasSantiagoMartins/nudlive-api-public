import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '@nudlive/kafka';
import { LiveGateway } from '../gateways/live.gateway';
import { EventTopics } from '@nudlive/events';
import { LiveMessageCreatedEvent } from '@nudlive/events/domains/chat/live-message-created.event';

@Injectable()
export class LiveMessageCreatedConsumer implements OnModuleInit {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly liveGateway: LiveGateway,
    ) { }

    async onModuleInit() {
        await this.kafkaService.createConsumer(
            'media-live-message-created-group',
            [EventTopics.LIVE_MESSAGE_CREATED],
            async (event) => {
                if (event.eventName === 'LiveMessageCreatedEvent') {
                    await this.handleLiveMessageCreated(event.data);
                }
            },
        );
    }

    private async handleLiveMessageCreated(
        data: LiveMessageCreatedEvent,
    ) {
        this.liveGateway.emitLiveMessage(data);
    }
}