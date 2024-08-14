import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);
  //   constructor(private readonly emailService: EmailService) {}

  @OnEvent('user.emailChanged')
  async handleEmailChangeEvent(payload: { userId: number; newEmail: string }) {
    const { userId, newEmail } = payload;

    this.logger.debug(`User #${userId} changed email to: ${newEmail} `);

    // await this.emailService.sendConfirmation(newEmail);
    // this.logger.log(`Confirmation email sent to ${newEmail} for user ID ${userId}`);
  }
}
