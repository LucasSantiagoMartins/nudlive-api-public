import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { KafkaService } from '@nudlive/kafka';
import { EventTopics, LiveMessageSentEvent } from '@nudlive/events';
import { corsConfig } from '@nudlive/common/config/cors.config';
import { PresenceService } from '../../presence/services/presence.service';
import { LiveMessageCreatedEvent } from '@nudlive/events/domains/chat/live-message-created.event';
import { LiveService } from '../services/live.service';

@WebSocketGateway({
    cors: corsConfig,
    namespace: '/live',
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly presenceService: PresenceService,
        private readonly jwtService: JwtService,
        private readonly kafkaService: KafkaService,
        private readonly liveService: LiveService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const cookies = client.handshake.headers.cookie;

            if (!cookies) {
                client.disconnect();
                return;
            }

            const parsed = cookie.parse(cookies);
            const token = parsed.access_token;

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            if (!userId) {
                client.disconnect();
                return;
            }

            client.data.userId = userId;
        } catch {
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const leaveData = await this.presenceService.leave(client.id);

        if (leaveData) {
            const { liveId, count } = leaveData;

            this.server.to(liveId).emit('user-left', {
                socketId: client.id,
            });

            this.server.to(liveId).emit('viewer-count', {
                count,
            });
        }
    }

    @SubscribeMessage('join-live')
    async handleJoinLive(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { liveId: string },
    ) {
        const userId = client.data.userId;

        await client.join(data.liveId);

        const count = await this.presenceService.join(
            data.liveId,
            userId,
            client.id,
        );

        this.server.to(data.liveId).emit('user-joined', {
            userId,
        });

        this.server.to(data.liveId).emit('viewer-count', {
            count,
        });
    }

    @SubscribeMessage('leave-live')
    async handleLeaveLive(
        @ConnectedSocket() client: Socket,
    ) {
        const leaveData = await this.presenceService.leave(client.id);

        if (leaveData) {
            const { liveId, count } = leaveData;

            await client.leave(liveId);

            this.server.to(liveId).emit('user-left', {
                socketId: client.id,
            });

            this.server.to(liveId).emit('viewer-count', {
                count,
            });
        }
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { liveId: string; message: string },
    ) {
        const userId = client.data.userId;

        await this.kafkaService.publish(
            EventTopics.LIVE_MESSAGE_SENT,
            data.liveId,
            'LiveMessageSentEvent',
            new LiveMessageSentEvent(
                data.liveId,
                userId,
                data.message,
            ),
        );
    }

    @SubscribeMessage('send-like')
    async handleSendLike(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { liveId: string },
    ) {
        const userId = client.data.userId;
        const currentLikes = await this.liveService.incrementLikes(data.liveId);

        this.server.to(data.liveId).emit('like-updated', {
            userId,
            likes: currentLikes,
        });
    }

    emitLiveMessage(data: LiveMessageCreatedEvent) {
        const standardizedMessage = {
            id: data.id,
            liveId: data.liveId,
            receiverId: null,
            message: data.message,
            createdAt: data.createdAt,
            user: {
                id: data.userId,
                username: data.username,
                profilePhotoUrl: data?.profilePhotoUrl,
            },
            receiver: null,
        };

        this.server.to(data.liveId).emit('new-message', standardizedMessage);
    }

    async emitLiveEnded(liveId: string) {
        this.server.to(liveId).emit('live-ended');
    }
}