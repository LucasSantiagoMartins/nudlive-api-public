import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveCategory, LiveStatus } from '../enums/live-status.enum';
import { MediaUser } from '../../media-user/entities/media-user.entity';

@Entity('lives')
export class Live {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    creatorId: number;

    @ManyToOne(() => MediaUser, (user) => user.lives, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'creatorId' })
    creator: MediaUser;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'enum', enum: LiveCategory, nullable: true })
    category: LiveCategory;

    @Column({ type: 'enum', enum: LiveStatus, default: LiveStatus.WAITING })
    status: LiveStatus;

    @Column({ type: 'int', default: 0 })
    likes: number;
    
    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    endedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}