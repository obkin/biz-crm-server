import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/modules/email/email.service';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('user.registered')
  @OnEvent('user.emailChanged')
  async handleEmailConfirmationEvent(payload: {
    userId: number;
    newEmail: string;
  }) {
    const { userId, newEmail } = payload;

    await this.emailService.sendConfirmationCode({ email: newEmail });
    this.logger.log(
      `Confirmation email sent to ${newEmail} for user ID ${userId}`,
    );
  }
}
