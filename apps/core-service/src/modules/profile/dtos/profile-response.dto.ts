import { UserRole } from "@nudlive/common/enums/user-role.enum";
import { Profile } from "apps/core-service/src/modules/profile/entities/profile.entity";

export class ProfileResponseDto {
    fullName: string;
    bio?: string;
    profilePhotoUrl?: string;
    bannerUrl?: string;
    birthDate: Date;
    location?: string;
    role: UserRole;
    followersCount: number;
    followingCount: number;
    joinedDate: Date;

    static fromEntity(entity: Profile): ProfileResponseDto {
        const dto = new ProfileResponseDto();
        dto.fullName = entity.fullName;
        dto.bio = entity.bio;
        dto.role = entity.user.role;
        dto.location = entity.location;
        dto.profilePhotoUrl = entity.profilePhotoUrl;
        dto.bannerUrl = entity.bannerUrl;
        dto.birthDate = entity.birthDate;
        dto.followersCount = entity.followersCount;
        dto.followingCount = entity.followingCount;
        dto.joinedDate = entity.user.createdAt;
        return dto;
    }
}