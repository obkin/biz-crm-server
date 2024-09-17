import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/services/users.service';
import { UsersManagementService } from 'src/modules/users/services/users-management.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class UserBlockGuard implements CanActivate {
  private readonly logger = new Logger(UserBlockGuard.name);

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
      this.logger.warn('User is not authorized');
      throw new UnauthorizedException('User is not authorized');
    }

    const existingUser = await this.usersService.getUserById(user.id);
    if (existingUser.isBlocked) {
      const isBlockValid = await this.usersManagementService.isBlockStillValid(
        user.id,
      );
      if (isBlockValid) {
        this.logger.warn('User is blocked');
        throw new ForbiddenException('This account is blocked');
      }
      this.logger.log('User is not blocked anymore');
    } else {
      const activeBlocks =
        await this.usersManagementService.countActiveBlocksForUser(
          Number(user.id),
        );
      if (activeBlocks > 0) {
        this.logger.warn(`This user (#${user.id}) has active block records!`);
      }
    }
    return true;
  }
}