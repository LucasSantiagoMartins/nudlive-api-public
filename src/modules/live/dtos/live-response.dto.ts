import { Live } from "../entities/live.entity";
import { LiveStatus } from "../enums/live-status.enum";

export class LiveDto {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    scheduledAt: Date;
    status: LiveStatus;
    startedAt: Date | null;
    creatorUsername?: string | null;
    viewersCount: number;

    static fromEntity(entity: Live, includeCreator = true): LiveDto {
        const dto = new LiveDto();
        dto.id = entity.id;
        dto.title = entity.title;
        dto.description = entity.description;
        dto.status = entity.status;
        dto.scheduledAt = entity.scheduledAt;
        dto.thumbnailUrl = entity.thumbnailUrl;
        dto.startedAt = entity.startedAt;
        dto.viewersCount = 0;

        if (includeCreator) {
            dto.creatorUsername = entity.creator?.username || null;
        }

        return dto;
    }
}