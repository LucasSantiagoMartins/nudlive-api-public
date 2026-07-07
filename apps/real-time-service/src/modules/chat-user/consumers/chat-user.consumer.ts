import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '@nudlive/kafka';
import { EventTopics } from '@nudlive/events';
import { ChatUserService } from '../services/chat-user.service';

@Injectable()
export class ChatUserConsumer implements OnModuleInit {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly chatUserService: ChatUserService,
    ) {}

    async onModuleInit() {
        await this.kafkaService.createConsumer(
            'realtime-chat-user-group',
            [EventTopics.USER_CREATED, EventTopics.USER_UPDATED],
            async (event) => {
                if (event.eventName === 'UserCreatedEvent') {
                    await this.chatUserService.create(event.data);
                }
                if (event.eventName === 'UserUpdatedEvent') {
                    await this.chatUserService.update(event.data.userId, event.data);
                }
            },
        );
    }
}