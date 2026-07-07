import { User } from '@modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'text', nullable: true })
    location: string;

    @Column({ type: 'int', default: 0 })
    followersCount: number;

    @Column({ type: 'int', default: 0 })
    followingCount: number;

    @ManyToMany(() => Profile, (profile) => profile.followers)
    @JoinTable({
        name: 'profile_followers',
        joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' }
    })
    following: Profile[];

    @ManyToMany(() => Profile, (profile) => profile.following)
    followers: Profile[];

    @Column({ nullable: true })
    profilePhotoUrl: string;

    @Column({ nullable: true })
    bannerUrl: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}