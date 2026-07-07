export interface KafkaEvent<T = any> {
    eventId: string;
    eventName: string;
    version: number;
    occurredAt: string;
    data: T;
}