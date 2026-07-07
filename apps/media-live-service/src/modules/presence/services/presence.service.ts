import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Viewer } from '../entities/viewer.entity';
import Redis from 'ioredis';

@Injectable()
export class PresenceService {
    constructor(
        @InjectRepository(Viewer)
        private readonly viewerRepository: Repository<Viewer>,

        @Inject('REDIS')
        private readonly redis: Redis,
    ) { }


    async join(liveId: string, userId: number, socketId: string): Promise<number> {
        const viewer = this.viewerRepository.create({
            liveId,
            userId,
            isConnected: true,
        });
        await this.viewerRepository.save(viewer);

        const roomKey = `live:${liveId}:users`;
        const socketKey = `socket:${socketId}`;

        await this.redis.sadd(roomKey, userId);
        await this.redis.set(socketKey, JSON.stringify({ liveId, userId }));

        return this.getViewerCount(liveId);
    }

    async leave(socketId: string): Promise<{ liveId: string; count: number } | null> {
        const socketKey = `socket:${socketId}`;
        const sessionData = await this.redis.get(socketKey);

        if (!sessionData) return null;

        const { liveId, userId } = JSON.parse(sessionData);
        const roomKey = `live:${liveId}:users`;

        await this.redis.srem(roomKey, userId);
        await this.redis.del(socketKey);

        await this.viewerRepository.update(
            { liveId, userId, isConnected: true },
            { isConnected: false, leftAt: new Date() },
        );

        const count = await this.getViewerCount(liveId);
        return { liveId, count };
    }

    async getViewerCount(liveId: string): Promise<number> {
        const roomKey = `live:${liveId}:users`;
        return this.redis.scard(roomKey);
    }

    async getOnlineUsers(liveId: string): Promise<string[]> {
        const roomKey = `live:${liveId}:users`;
        return this.redis.smembers(roomKey);
    }
}
