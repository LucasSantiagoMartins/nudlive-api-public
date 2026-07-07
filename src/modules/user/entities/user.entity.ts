import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { UserRole } from '@shared/enums/user-role.enum';
import { Profile } from '@modules/profile/entities/profile.entity';
import { Live } from '@modules/live/entities/live.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ unique: true, nullable: true })
    phoneNumber: string;

    @Column({ select: false, nullable: true })
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ default: 'local' })
    provider: 'local' | 'google';

    @Column({ nullable: true })
    googleId: string;

    @Column({ default: false })
    isDeleted: boolean;

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile;

    @OneToMany(() => Live, (live) => live.creator)
    lives: Live[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}