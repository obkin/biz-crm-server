import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/services/users.service';
import { UsersManagementService } from 'src/modules/users/services/users-management.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class UserBlockGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersManagementService: UsersManagementService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User is not authorized');
    }
    const existingUser = await this.usersService.getUserById(user.id);
    if (existingUser.isBlocked) {
      const isBlockValid = await this.usersManagementService.isBlockStillValid(
        user.id,
      );
      if (isBlockValid) {
        throw new ForbiddenException('This account is blocked');
      }
    }
    return true;
  }
}
