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
import { PresenceService } from '../../presence/services/presence.service';
import { ChatService } from '../../chat/services/chat.service';
import { corsConfig } from '@config/cors.config';
import * as cookie from 'cookie';
import { ChatMessageResponseDto } from '@modules/chat/dtos/chat-message-response.dto';

@WebSocketGateway({
    cors: corsConfig,
    namespace: '/live',
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly presenceService: PresenceService,
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
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
            this.server.to(liveId).emit('user-left', { socketId: client.id });
            this.server.to(liveId).emit('viewer-count', { count });
        }
    }

    @SubscribeMessage('join-live')
    async handleJoinLive(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { liveId: string },
    ) {
        const userId = client.data.userId;
        await client.join(data.liveId);

        const count = await this.presenceService.join(data.liveId, userId, client.id);

        this.server.to(data.liveId).emit('user-joined', { userId });
        this.server.to(data.liveId).emit('viewer-count', { count });
    }

    @SubscribeMessage('leave-live')
    async handleLeaveLive(@ConnectedSocket() client: Socket) {
        const leaveData = await this.presenceService.leave(client.id);
        if (leaveData) {
            const { liveId, count } = leaveData;
            await client.leave(liveId);
            this.server.to(liveId).emit('user-left', { socketId: client.id });
            this.server.to(liveId).emit('viewer-count', { count });
        }
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { liveId: string; message: string },
    ) {
        const userId = client.data.userId;
        const savedMessage = await this.chatService.saveLiveMessage(data.liveId, userId, data.message); 

        const responseDto = ChatMessageResponseDto.fromEntity(savedMessage);

        this.server.to(data.liveId).emit('new-message', responseDto);
    }

    async emitLiveEnded(liveId: string) {
        this.server.to(liveId).emit('live-ended');
    }
}