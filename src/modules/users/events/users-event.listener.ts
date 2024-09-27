import { ConflictException, Injectable, Logger } from '@nestjs/common';
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

  // --- Events ---

  @OnEvent('user.registered')
  async handleUserRegistredEvent(payload: UserRegisteredPayload) {
    const { userId, email } = payload;
    try {
      await this.emailService.sendConfirmationCode({ email });
      this.logEvent('user.registered', `userId: ${userId}`);
    } catch (e) {
      this.logError('user.registered', email, e.message);
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
      this.logEvent('user.emailChanged', `userId: ${userId}`);
    } catch (e) {
      if (e instanceof ConflictException) {
        try {
          this.logger.warn('This user did not confirmed the previous email');
          await this.emailService.sendConfirmationCode({
            email: newEmail,
          });
        } catch (e) {
          this.logError('user.emailChanged', newEmail, e.message);
        }
      } else {
        this.logError('user.emailChanged', newEmail, e.message);
      }
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
      this.logEvent('user.emailVerified', `user: ${userEmail}`);
    } catch (e) {
      this.logError('user.emailVerified', userEmail, e.message);
    }
  }

  // --- Methods ---

  private logEvent(eventType: string, userIdentifier: string) {
    this.logger.log(`Event: ${eventType} (${userIdentifier})`);
  }

  private logError(eventType: string, userIdentifier: string, error: string) {
    this.logger.error(
      `Event: ${eventType} (user: ${userIdentifier}). Error: ${error}`,
    );
  }
}
