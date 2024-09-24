import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/modules/email/email.service';
import { UsersService } from '../services/users.service';
import { UsersManagementService } from '../services/users-management.service';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
    private readonly usersManagementService: UsersManagementService,
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
    oldEmail: string;
    newEmail: string;
  }) {
    const { userId, oldEmail, newEmail } = payload;

    await this.usersManagementService.updateEmailConfirmationStatus(
      oldEmail,
      false,
    );
    await this.emailService.sendConfirmationCode({ email: newEmail });
    this.logger.log(`Event: user.emailChanged (userId: ${userId})`);
  }

  @OnEvent('user.emailVerified')
  async handleEmailConfirmedEvent(payload: { userEmail: string }) {
    const { userEmail } = payload;

    await this.usersManagementService.updateEmailConfirmationStatus(
      userEmail,
      true,
    );
    this.logger.log(`Event: user.emailVerified (user: ${userEmail})`);
  }
}
