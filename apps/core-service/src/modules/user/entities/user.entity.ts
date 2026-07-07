import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { UserRole } from '@nudlive/common/enums/user-role.enum';
import { Profile } from '../../profile/entities/profile.entity';

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

    @OneToOne(() => Profile , (profile) => profile.user, { cascade: true })
    profile: Profile;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}