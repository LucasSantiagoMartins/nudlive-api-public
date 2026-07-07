export class CreateProfileDto {
    fullName: string;
    birthDate?: Date;
}

export class UpdateProfileDto {
    fullName?: string;
    birthDate?: Date;
    bio?: string;
    location?: string;
    profilePhotoUrl?: string;
    bannerUrl?: string;
}