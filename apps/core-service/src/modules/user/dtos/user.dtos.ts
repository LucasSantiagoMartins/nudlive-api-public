import { User } from "../entities/user.entity";


export class CreatorProfileDto {
    username: string;
    userId: number;
    fullName: string;
    bio: string | null;
    location: string | null;
    profilePhotoUrl: string | null;
    bannerUrl: string | null;
    followersCount: number;
    followingCount: number;
    joinedDate: Date;
    isFollowing: boolean;

    static fromEntity(
        user: User,
        isFollowing = false,
    ): CreatorProfileDto {

        const dto = new CreatorProfileDto();

        dto.username = user.username;
        dto.userId = user.id;
        dto.fullName = user.profile?.fullName ?? '';
        dto.bio = user.profile?.bio ?? null;
        dto.location = user.profile?.location ?? null;
        dto.profilePhotoUrl = user.profile?.profilePhotoUrl ?? null;
        dto.bannerUrl = user.profile?.bannerUrl ?? null;
        dto.followersCount = user.profile?.followersCount ?? 0;
        dto.followingCount = user.profile?.followingCount ?? 0;
        dto.joinedDate = user.createdAt;
        dto.isFollowing = isFollowing;

        return dto;
    }
}