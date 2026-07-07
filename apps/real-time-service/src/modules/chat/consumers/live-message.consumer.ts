import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '@nudlive/kafka';
import { EventTopics, LiveMessageSentEvent } from '@nudlive/events';
import { ChatService } from '../services/chat-service.service';

@Injectable()
export class LiveMessageConsumer implements OnModuleInit {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly chatService: ChatService,
    ) { }

    async onModuleInit() {
        await this.kafkaService.createConsumer(
            'real-time-live-message-group',
            [EventTopics.LIVE_MESSAGE_SENT],
            async (event) => {
                if (event.eventName === 'LiveMessageSentEvent') {
                    await this.handleLiveMessageSent(event.data);
                }
            },
        );
    }

    private async handleLiveMessageSent(data: LiveMessageSentEvent) {
        await this.chatService.saveLiveMessage(
            data.liveId,
            data.userId,
            data.message,
        );
    }
}