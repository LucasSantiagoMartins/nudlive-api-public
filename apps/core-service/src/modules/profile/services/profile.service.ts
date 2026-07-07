import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { InternalCreateProfileDto, UpdateProfileDto } from '../dtos/profile.dto';
import { ProfileValidator } from '../validators/profile.validator';
import { ProfileQueryService } from './profile-query.service';
import { User } from '../../user/entities/user.entity';
import { KafkaService } from '@nudlive/kafka';
import { EventTopics, UserUpdatedEvent } from '@nudlive/events';
import { UploadService } from '../../upload/services/upload.service';

@Injectable()
export class ProfileService {
    private readonly validator = new ProfileValidator();

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        private readonly profileQueryService: ProfileQueryService,
        private readonly kafkaService: KafkaService,
        private readonly uploadService: UploadService,
    ) { }

    async createProfile(user: User, data: InternalCreateProfileDto, manager?: EntityManager): Promise<Profile> {
        const repo = manager ? manager.getRepository(Profile) : this.profileRepository;

        const profile = repo.create({
            fullName: data.fullName,
            birthDate: data.birthDate,
            user,
        });

        return await repo.save(profile);
    }

    async createFromGoogle(userId: number, profile: any, manager?: EntityManager): Promise<Profile> {
        const repo = manager ? manager.getRepository(Profile) : this.profileRepository;
        const profilePhotoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        const profileData = repo.create({
            fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            profilePhotoUrl,
            user: { id: userId } as User,
        });

        return await repo.save(profileData);
    }

    async toggleFollow(followerUserId: number, targetUsername: string): Promise<void> {
        const followerProfile = await this.profileRepository.findOne({
            where: { user: { id: followerUserId } },
            relations: ['following', 'user']
        });

        const targetProfile = await this.profileRepository.findOne({
            where: { user: { username: targetUsername } },
            relations: ['followers', 'user']
        });

        if (!followerProfile || !targetProfile) {
            throw new Error('Perfil não encontrado.');
        }

        if (followerProfile.id === targetProfile.id) {
            throw new Error('Você não pode seguir a si mesmo.');
        }

        const isFollowing = followerProfile.following.some(p => p.id === targetProfile.id);

        if (isFollowing) {
            followerProfile.following = followerProfile.following.filter(p => p.id !== targetProfile.id);
            targetProfile.followers = targetProfile.followers.filter(p => p.id !== followerProfile.id);
        } else {
            followerProfile.following.push(targetProfile);
            targetProfile.followers.push(followerProfile);
        }

        followerProfile.followingCount = followerProfile.following.length;
        targetProfile.followersCount = targetProfile.followers.length;

        await this.profileRepository.save(followerProfile);
        await this.profileRepository.save(targetProfile);
    }

    async updateProfile(userId: number, data: UpdateProfileDto): Promise<Profile> {
        this.validator.validateUpdate(data);

        const profile = await this.profileQueryService.getByUserId(userId);

        const oldPhotoUrl = profile.profilePhotoUrl;
        const oldBannerUrl = profile.bannerUrl;

        if (data.profilePhotoUrl && oldPhotoUrl && data.profilePhotoUrl !== oldPhotoUrl) {
            await this.uploadService.deleteFileFromUrl(oldPhotoUrl);
        }

        if (data.bannerUrl && oldBannerUrl && data.bannerUrl !== oldBannerUrl) {
            await this.uploadService.deleteFileFromUrl(oldBannerUrl);
        }

        Object.assign(profile, data);
        const updatedProfile = await this.profileRepository.save(profile);

        if (data.fullName || data.profilePhotoUrl) {
            await this.kafkaService.publish(
                EventTopics.USER_UPDATED,
                userId.toString(),
                'UserUpdatedEvent',
                new UserUpdatedEvent(
                    userId,
                    data.fullName !== profile?.fullName ? data.fullName : undefined,
                    data.profilePhotoUrl !== oldPhotoUrl ? data.profilePhotoUrl : undefined
                ),
            );
        }

        return updatedProfile;
    }
}