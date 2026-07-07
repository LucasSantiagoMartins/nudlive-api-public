import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Live } from '../entities/live.entity';
import { LiveStatus } from '../enums/live-status.enum';
import { LiveDto } from '../dtos/live-response.dto';
import { PresenceService } from '@modules/presence/services/presence.service';

@Injectable()
export class LiveQueryService {
    constructor(
        @InjectRepository(Live)
        private readonly liveRepository: Repository<Live>,
        private readonly presenceService: PresenceService,
    ) { }

    async getById(id: string): Promise<LiveDto> {
        const live = await this.liveRepository.findOne({
            where: { id },
            relations: ['creator'],
        });

        if (!live) {
            throw new NotFoundException('Live não encontrada');
        }

        const dto = LiveDto.fromEntity(live);

        if (live.status === LiveStatus.LIVE) {
            dto.viewersCount = await this.presenceService.getViewerCount(id);
        }

        return dto;
    }

    async getByIdAndCreator(id: string, creatorId: number): Promise<Live> {
        const live = await this.liveRepository.findOne({
            where: {
                id,
                creatorId,
            },
            relations: ['creator'],
        });

        if (!live) {
            throw new NotFoundException('Live não encontrada');
        }

        return live;
    }

    async getByCreator(creatorId: number): Promise<LiveDto[]> {
        const lives = await this.liveRepository.find({
            where: { creatorId },
            order: { createdAt: 'DESC' },
        });

        return Promise.all(
            lives.map(async (live) => {
                const dto = LiveDto.fromEntity(live, false);
                if (live.status === LiveStatus.LIVE) {
                    dto.viewersCount = await this.presenceService.getViewerCount(live.id);
                }
                return dto;
            })
        );
    }

    async getByCreatorUsername(username: string): Promise<LiveDto[]> {
        if (!username) {
            throw new BadRequestException('O nome de utilizador do criador é obrigatório');
        }

        const lives = await this.liveRepository.find({
            where: {
                creator: { username },
                status: In([LiveStatus.LIVE, LiveStatus.WAITING]),
            },
            relations: ['creator'],
            order: {
                status: 'ASC',
                createdAt: 'DESC',
            },
        });

        return Promise.all(
            lives.map(async (live) => {
                const dto = LiveDto.fromEntity(live);
                if (live.status === LiveStatus.LIVE) {
                    dto.viewersCount = await this.presenceService.getViewerCount(live.id);
                }
                return dto;
            }),
        );
    }

    async getActiveLives(): Promise<LiveDto[]> {
        const lives = await this.liveRepository.find({
            where: {
                status: LiveStatus.LIVE,
            },
            relations: ['creator'],
            order: {
                startedAt: 'DESC',
            },
        });

        return Promise.all(
            lives.map(async (live) => {
                const dto = LiveDto.fromEntity(live);
                dto.viewersCount = await this.presenceService.getViewerCount(live.id);
                return dto;
            })
        );
    }
}