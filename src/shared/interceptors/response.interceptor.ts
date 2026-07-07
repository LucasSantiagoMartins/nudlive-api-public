import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ResponseDto<T>> {
    constructor(private readonly reflector: Reflector) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ResponseDto<T>> {
        const message =
            this.reflector.get<string>(
                SUCCESS_MESSAGE_KEY,
                context.getHandler(),
            ) || 'Operação realizada com sucesso';

        return next.handle().pipe(
            map((data) => ({
                success: true,
                message,
                data,
            })),
        );
    }
}
