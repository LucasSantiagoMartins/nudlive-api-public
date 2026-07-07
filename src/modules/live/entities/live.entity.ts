import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveStatus } from '../enums/live-status.enum';
import { User } from '@modules/user/entities/user.entity';

@Entity('lives')
export class Live {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    creatorId: number;

    @ManyToOne(() => User, (user) => user.lives, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'creatorId' })
    creator: User;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    thumbnailUrl: string;

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'enum', enum: LiveStatus, default: LiveStatus.WAITING })
    status: LiveStatus;

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