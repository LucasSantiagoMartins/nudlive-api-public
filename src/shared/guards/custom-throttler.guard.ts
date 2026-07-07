import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected throwThrottlingException(): Promise<void> {
        throw new ThrottlerException(
            'Você fez muitas tentativas. Aguarde 1 minuto antes de tentar novamente',
        );
    }
}