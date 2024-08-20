import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/modules/email/email.service';
import { UsersService } from '../users.service';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistredEvent(payload: { userId: number; email: string }) {
    const { userId, email } = payload;

    await this.emailService.sendConfirmationCode({ email });
    this.logger.log(`Event: user.registered (userId: ${userId})`);
  }

  @OnEvent('user.emailChanged')
  async handleUserChangedEmailEvent(payload: {
    userId: number;
    newEmail: string;
  }) {
    const { userId, newEmail } = payload;

    await this.emailService.sendConfirmationCode({ email: newEmail });
    this.logger.log(`Event: user.emailChanged (userId: ${userId})`);
  }

  @OnEvent('user.emailVerified')
  async handleEmailConfirmedEvent(payload: { userEmail: string }) {
    const { userEmail } = payload;

    await this.userService.updateEmailConfirmationStatus(userEmail, true);
    this.logger.log(`Event: user.emailVerified (user: ${userEmail})`);
  }
}
