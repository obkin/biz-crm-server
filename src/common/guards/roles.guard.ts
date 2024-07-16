import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('[RolesGuard] Access token is missing');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      const hasRole = requiredRoles.some((role) =>
        payload.roles?.includes(role),
      );
      if (!hasRole) {
        throw new ForbiddenException(
          '[RolesGuard] You do not have required role',
        );
      }

      return true;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('[RolesGuard] Access token expired');
      } else if (e.name === 'ForbiddenException') {
        throw e;
      } else {
        throw new UnauthorizedException(
          `[RolesGuard] Invalid access token: ${e}`,
        );
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
