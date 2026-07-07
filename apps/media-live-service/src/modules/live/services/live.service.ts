import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Live } from '../entities/live.entity';
import { LiveStatus } from '../enums/live-status.enum';
import { CreateLiveDto } from '../dtos/create-live.dto';
import { LiveValidator } from '../validators/live-validator';
import { LiveQueryService } from './live-query.service';
import { LiveKitService } from './livekit.service';

@Injectable()
export class LiveService {
    private readonly validator = new LiveValidator();

    constructor(
        @InjectRepository(Live)
        private readonly liveRepository: Repository<Live>,
        private readonly liveQueryService: LiveQueryService,
        private readonly livekitService: LiveKitService,
    ) { }

    async create(creatorId: number, data: CreateLiveDto): Promise<Live> {
        this.validator.validateCreate(data);

        const live = this.liveRepository.create({
            ...data,
            creatorId,
            status: LiveStatus.WAITING,
        });

        return this.liveRepository.save(live);
    }

    async incrementLikes(id: string): Promise<number> {
        await this.liveRepository.increment({ id }, 'likes', 1);
        const live = await this.liveRepository.findOne({ where: { id }, select: ['likes'] });
        return live?.likes || 0;
    }

    async updateStatus(id: string, creatorId: number, status: LiveStatus): Promise<Live> {
        const live = await this.liveQueryService.getByIdAndCreator(id, creatorId);

        if (status === LiveStatus.LOCKED) {
            if (live.status === LiveStatus.ENDED || live.status === LiveStatus.LOCKED) {
                throw new BadRequestException('Não é possível trancar uma live encerrada ou que já está trancada');
            }
        }

        if (status === LiveStatus.LIVE) {
            if (live.status !== LiveStatus.WAITING) {
                throw new BadRequestException('Live já iniciada ou encerrada');
            }
            live.startedAt = new Date();
        }

        if (status === LiveStatus.ENDED) {
            if (live.status !== LiveStatus.LIVE) {
                throw new BadRequestException('Apenas lives em direto podem ser encerradas');
            }
            live.endedAt = new Date();
        }

        live.status = status;
        return this.liveRepository.save(live);
    }

    async getLiveKitToken(id: string, userId: number) {
        const live = await this.liveQueryService.getEntityById(id);

        if (live.status === LiveStatus.ENDED || live.status === LiveStatus.LOCKED) {
            throw new UnauthorizedException('Esta live não está disponível no momento');
        }

        const isPublisher = live.creatorId === userId;

        const token = await this.livekitService.generateToken(
            live.id,
            String(userId),
            isPublisher,
        );

        return {
            token,
            url: process.env.LIVEKIT_EXTERNAL_URL || 'ws://localhost:7880',
            isPublisher,
        };
    }
}