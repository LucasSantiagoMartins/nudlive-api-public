import { ChatMessage } from '../entities/chat-message.entity';

export class ChatMessageResponseDto {
    id: string;
    liveId: string | null;
    receiverId: string | null;
    message: string;
    createdAt: Date;
    user: {
        id: number;
        username: string;
        profilePhotoUrl: string | null;
    };
    receiver?: {
        id: number;
        username: string;
        profilePhotoUrl: string | null;
    } | null;

    static fromEntity(entity: ChatMessage): ChatMessageResponseDto {
        return {
            id: entity.id,
            liveId: entity.liveId || null,
            receiverId: entity.receiverId ? String(entity.receiverId) : null,
            message: entity.message,
            createdAt: entity.createdAt,
            user: {
                id: entity.user?.id,
                username: entity.user?.username,
                profilePhotoUrl: entity.user?.profile?.profilePhotoUrl || null,
            },
            receiver: entity.receiver ? {
                id: entity.receiver.id,
                username: entity.receiver.username,
                profilePhotoUrl: entity.receiver.profile?.profilePhotoUrl || null,
            } : null,
        };
    }
}