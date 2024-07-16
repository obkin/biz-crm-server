import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('[JwtAuthGuard] Access token is missing');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        const userId = Number(this.getUserIdFromExpiredToken(token));
        const refreshToken = await this.authService.getRefreshToken(userId);
        if (!refreshToken) {
          throw new UnauthorizedException(
            '[JwtAuthGuard] Refresh token is missing',
          );
        }

        try {
          const newAccessToken = await this.authService.refreshAccessToken(
            refreshToken.refreshToken,
          );
          request.headers.authorization = `Bearer ${newAccessToken}`;
          const payload = this.jwtService.verify(newAccessToken);
          request.user = payload;
        } catch (refreshError) {
          throw new UnauthorizedException(
            '[JwtAuthGuard] Invalid refresh token',
          );
        }
      } else {
        throw new UnauthorizedException(
          `[JwtAuthGuard] Invalid access token: ${e}`,
        );
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getUserIdFromExpiredToken(token: string): number | undefined {
    try {
      const payload = this.jwtService.decode(token) as any;
      return payload.id ? payload.id : undefined;
    } catch (e) {
      return undefined;
    }
  }
}
