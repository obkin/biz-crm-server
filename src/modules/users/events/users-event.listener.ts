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
    email: string;
  }) {
    const { userId, email } = payload;

    await this.emailService.sendConfirmationCode({ email });
    this.logger.log(
      `Confirmation email sent to ${email} for user ID ${userId}`,
    );
  }
}
