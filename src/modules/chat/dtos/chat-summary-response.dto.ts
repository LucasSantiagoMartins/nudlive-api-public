import { ChatMessage } from '../entities/chat-message.entity';

export class ChatSummaryResponseDto {
    id: string;
    contactId: number;
    contactName: string;
    contactUsername: string;
    contactProfilePhotoUrl: string;
    lastMessage: string;
    createdAt: Date;

    static fromEntity(message: ChatMessage, currentUserId: number): ChatSummaryResponseDto {
        const isSender = message.userId === currentUserId;
        const contact = isSender ? message.receiver : message.user;

        const dto = new ChatSummaryResponseDto();
        dto.id = message.id;
        dto.contactId = contact.id;
        dto.contactName = contact.profile?.fullName || contact.username;
        dto.contactProfilePhotoUrl = contact.profile?.profilePhotoUrl || null;
        dto.contactUsername = contact.username;
        dto.lastMessage = message.message;
        dto.createdAt = message.createdAt;

        return dto;
    }
}