import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('viewers')
export class Viewer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    liveId: string;

    @Column()
    userId: number;

    @CreateDateColumn()
    joinedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    leftAt: Date;

    @Column({ type: 'boolean', default: true })
    isConnected: boolean;
}