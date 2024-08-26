import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/modules/email/email.service';
import { UsersService } from '../services/users.service';
import { UserEntity } from '../entities/user.entity';
import { UsersManagementService } from '../services/users-management.service';
import { UserDeleteDto } from '../dto/user-delete.dto';
import { UserBlockDto } from '../dto/user-block.dto';

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

  @OnEvent('user.blocked')
  async handleUserBlockEvent(payload: {
    admin: UserEntity;
    user: UserEntity;
    dto: UserBlockDto;
  }) {
    const { admin, user, dto } = payload;

    await this.usersManagementService.saveBlockRecord(admin, user, dto);
    this.logger.log(`Event: user.blocked (user: ${user.id})`);
  }

  @OnEvent('user.deleted')
  async handleUserDeletionEvent(payload: {
    admin: UserEntity;
    user: UserEntity;
    dto: UserDeleteDto;
  }) {
    const { admin, user, dto } = payload;

    await this.usersManagementService.saveDeletionRecord(admin, user, dto);
    this.logger.log(`Event: user.deleted (user: ${user.id})`);
  }
}
