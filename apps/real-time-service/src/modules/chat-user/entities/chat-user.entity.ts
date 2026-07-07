import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ChatMessage } from '../../chat/entities/chat-message.entity';

@Entity('chat_users')
export class ChatUser {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column()
  role: string;

  @OneToMany(() => ChatMessage, (message) => message.user)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}