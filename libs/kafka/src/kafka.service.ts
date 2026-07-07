import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { KafkaEvent } from './kafka.interfaces';
import { KAFKA_CLIENT } from './kafka.constants';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;
  private consumers: Consumer[] = [];
  private requiredTopics: Set<string> = new Set();

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: Kafka) {
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  async publish(topic: string, key: string, eventName: string, data: any, version = 1): Promise<void> {
    const payload: KafkaEvent = {
      eventId: crypto.randomUUID(),
      eventName,
      version,
      occurredAt: new Date().toISOString(),
      data,
    };

    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload),
        },
      ],
    });
  }

  async createConsumer(groupId: string, topics: string[], onMessage: (event: KafkaEvent) => Promise<void>): Promise<void> {
    await this.ensureTopicsExist(topics);

    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const parsedEvent = JSON.parse(message.value.toString()) as KafkaEvent;
        await onMessage(parsedEvent);
      },
    });

    this.consumers.push(consumer);
  }

  private async ensureTopicsExist(topics: string[]): Promise<void> {
    const topicsToCreate = topics.filter(topic => !this.requiredTopics.has(topic));
    
    if (topicsToCreate.length === 0) return;

    const admin = this.kafka.admin();
    await admin.connect();

    try {
      const existingTopics = await admin.listTopics();
      const missingTopics = topicsToCreate.filter(topic => !existingTopics.includes(topic));

      if (missingTopics.length > 0) {
        await admin.createTopics({
          waitForLeaders: true,
          topics: missingTopics.map(topic => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          })),
        });
      }

      topicsToCreate.forEach(topic => this.requiredTopics.add(topic));
    } finally {
      await admin.disconnect();
    }
  }
}