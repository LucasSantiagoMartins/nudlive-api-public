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
import { ChatService } from '../services/chat.service';
import { corsConfig } from '@config/cors.config';
import * as cookie from 'cookie';
import { ChatMessageResponseDto } from '@modules/chat/dtos/chat-message-response.dto';

@WebSocketGateway({
    cors: corsConfig,
    namespace: '/chat',
})
export class PrivateChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private activeUsers = new Map<number, string>();

    constructor(
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
            this.activeUsers.set(userId, client.id);
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.activeUsers.delete(userId);
        }
    }

    @SubscribeMessage('send-private-message')
    async handleSendPrivateMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { receiverId: number; message: string },
    ) {
        const senderId = client.data.userId;

        try {
            const savedMessage = await this.chatService.savePrivateMessage(senderId, data.receiverId, data.message);
            const responseDto = ChatMessageResponseDto.fromEntity(savedMessage);

            this.server.to(client.id).emit('new-private-message', responseDto);

            const receiverSocketId = this.activeUsers.get(Number(data.receiverId));
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('new-private-message', responseDto);
            }
        } catch (err) {
        }
    }

    @SubscribeMessage('private-typing')
    handlePrivateTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { receiverId: number },
    ) {
        const senderId = client.data.userId;
        const receiverSocketId = this.activeUsers.get(Number(data.receiverId));

        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('private-typing', { senderId });
        }
    }

    @SubscribeMessage('private-stop-typing')
    handlePrivateStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { receiverId: number },
    ) {
        const senderId = client.data.userId;
        const receiverSocketId = this.activeUsers.get(Number(data.receiverId));

        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('private-stop-typing', { senderId });
        }
    }
}