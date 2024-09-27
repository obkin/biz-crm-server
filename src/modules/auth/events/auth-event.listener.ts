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
    try {
      const isUserLoggedIn = await this.authService.checkIsUserLoggedIn(userId);
      if (isUserLoggedIn) {
        await this.authService.userLogout(userId);
        this.logger.log(`Event: auth.userLogout (userId: ${userId})`);
      } else {
        this.logger.log(
          `Event: auth.userLogout (user #${userId} was not logged in)`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Event: auth.userLogout (user: ${userId}). Error: ${e.message}`,
      );
    }
  }
}
