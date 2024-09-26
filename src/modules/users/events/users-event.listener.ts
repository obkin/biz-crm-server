import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/modules/email/email.service';
import { UsersManagementService } from '../services/users-management.service';
import {
  UserEmailChangedPayload,
  UserEmailVerifiedPayload,
  UserRegisteredPayload,
} from './interfaces';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly usersManagementService: UsersManagementService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistredEvent(payload: UserRegisteredPayload) {
    const { userId, email } = payload;
    try {
      await this.emailService.sendConfirmationCode({ email });
      this.logger.log(`Event: user.registered (userId: ${userId})`);
    } catch (e) {
      this.logger.error(
        `Event: user.registered, user: ${email}. Error: ${e.message}`,
      );
    }
  }

  @OnEvent('user.emailChanged')
  async handleUserChangedEmailEvent(payload: UserEmailChangedPayload) {
    const { userId, oldEmail, newEmail } = payload;
    try {
      await this.usersManagementService.updateEmailConfirmationStatus(
        oldEmail,
        false,
      );
      await this.emailService.sendConfirmationCode({ email: newEmail });
      this.logger.log(`Event: user.emailChanged (userId: ${userId})`);
    } catch (e) {
      this.logger.error(
        `Event: user.emailChanged, user: ${newEmail}. Error: ${e.message}`,
      );
    }
  }

  @OnEvent('user.emailVerified')
  async handleEmailConfirmedEvent(payload: UserEmailVerifiedPayload) {
    const { userEmail } = payload;
    try {
      await this.usersManagementService.updateEmailConfirmationStatus(
        userEmail,
        true,
      );
      this.logger.log(`Event: user.emailVerified (user: ${userEmail})`);
    } catch (e) {
      this.logger.error(
        `Event: user.emailVerified, user: ${userEmail}. Error: ${e.message}`,
      );
    }
  }

  private logEvent(eventType: string, message: string) {
    this.logger.log(`Event: ${eventType}. ${message}`);
  }

  private logError(eventType: string, userIdentifier: string, error: string) {
    this.logger.error(
      `Event: ${eventType}, user: ${userIdentifier}. Error: ${error}`,
    );
  }
}
