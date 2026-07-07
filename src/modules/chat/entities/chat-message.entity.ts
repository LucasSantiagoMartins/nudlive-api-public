import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    liveId: string;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    receiverId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'receiverId' })
    receiver: User;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;
}