import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@nudlive/auth/decorators/roles.decorator';
import { UserRole } from '@nudlive/common/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true; 

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Você não tem permissão para acessar esta área');
    }

    return true;
  }
}
