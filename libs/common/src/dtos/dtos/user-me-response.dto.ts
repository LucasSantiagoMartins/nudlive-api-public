// import { User } from "apps/core-service/src/modules/user/entities/user.entity";

// export class UserMeResponseDto {
//     email: string;
//     phoneNumber: string;
//     fullName: string;
//     address: string;
//     profilePictureUrl: string | null;
//     profileBannerUrl: string | null;
//     role: string;
//     slug?: string;
//     isVerified: boolean;
//     nearestTaxiStop?: string;
//     nearestMotoStop?: string;
//     latitude?: number;
//     longitude?: number;
//     isOnline: boolean;
//     lastSeenAt: Date | null;

//     static fromEntity(user: User, profile?: any): UserMeResponseDto {
//         const dto = new UserMeResponseDto();
//         dto.email = user.email;
//         dto.phoneNumber = user.phoneNumber;
//         dto.role = user.role;
//         dto.isOnline = user.isOnline;
//         dto.lastSeenAt = user.lastSeenAt;

//         const targetProfile = profile || user.profile;

//         dto.fullName = targetProfile?.fullName;
//         dto.address = targetProfile?.address;
//         dto.profilePictureUrl = targetProfile?.profilePictureUrl || null;
//         dto.profileBannerUrl = targetProfile?.profileBannerUrl || null;
//         dto.slug = targetProfile?.slug || null;
//         dto.isVerified = user?.isVerified || null;
//         dto.nearestTaxiStop = targetProfile?.nearestTaxiStop || null;
//         dto.nearestMotoStop = targetProfile?.nearestMotoStop || null;
//         dto.latitude = targetProfile?.latitude || null;
//         dto.longitude = targetProfile?.longitude || null;

//         return dto;
//     }
// }