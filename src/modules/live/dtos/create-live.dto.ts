export class CreateLiveDto {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    category?: string;
    scheduledAt: Date;
}