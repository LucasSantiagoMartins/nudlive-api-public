import { Profile } from 'apps/core-service/src/modules/profile/entities/profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ type: 'enum', enum: ['image', 'video'] })
    type: 'image' | 'video';

    @Column({ type: 'text', nullable: true })
    caption: string;

    @Column({ type: 'int', default: 0 })
    likesCount: number;

    @Column({ type: 'int', default: 0 })
    commentsCount: number;

    @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
    profile: Profile;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}