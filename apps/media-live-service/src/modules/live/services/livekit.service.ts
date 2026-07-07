import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
    private apiKey = process.env.LIVEKIT_API_KEY;
    private apiSecret = process.env.LIVEKIT_API_SECRET;

    async generateToken(roomName: string, participantName: string, isPublisher: boolean): Promise<string> {
        try {
            const at = new AccessToken(this.apiKey, this.apiSecret, {
                identity: participantName,
                ttl: '2h',
            });

            at.addGrant({
                roomJoin: true,
                room: roomName,
                canPublish: isPublisher,
                canSubscribe: true,
                canPublishData: isPublisher,
            });

            return await at.toJwt();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao gerar token do LiveKit');
        }
    }
}