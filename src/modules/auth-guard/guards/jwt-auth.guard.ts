import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.access_token;

    if (isPublic) {
      if (!token) {
        request['user'] = null;
        return true;
      }

      try {
        request['user'] = this.jwtService.verify(token);
      } catch {
        request['user'] = null;
      }

      return true;
    }

    if (!token) {
      throw new UnauthorizedException(
        'Você precisa estar logado para acessar esta área',
      );
    }

    try {
      request['user'] = this.jwtService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException(
        'Sessão expirada. Faça login novamente',
      );
    }
  }
}