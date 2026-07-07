import { ChatUser } from 'apps/real-time-service/src/modules/chat-user/entities/chat-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    liveId: string;

    @Column()
    userId: number;

    @ManyToOne(() => ChatUser)
    @JoinColumn({ name: 'userId' })
    user: ChatUser;

    @Column({ nullable: true })
    receiverId: number;

    @ManyToOne(() => ChatUser)
    @JoinColumn({ name: 'receiverId' })
    receiver: ChatUser;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;
}