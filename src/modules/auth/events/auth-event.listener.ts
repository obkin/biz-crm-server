import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthEventListener {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthEventListener.name);

  @OnEvent('auth.userLogout')
  async handleUserLogout(payload: { userId: number }) {
    const { userId } = payload;

    const isUserLoggined = await this.authService.checkIsUserLoggedIn(userId);
    if (isUserLoggined) {
      await this.authService.userLogout(userId);
      this.logger.log(`Event: auth.userLogout (userId: ${userId})`);
    } else {
      this.logger.log(
        `Event: auth.userLogout (user #${userId} was not logged in)`,
      );
    }
  }
}
