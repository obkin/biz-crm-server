import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersUnblockRepository } from 'src/modules/users/repositories/users-management.repository';
import { UsersManagementService } from 'src/modules/users/services/users-management.service';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class ExpiredBlocksUpdaterService {
  private readonly logger = new Logger(ExpiredBlocksUpdaterService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly usersManagementService: UsersManagementService,
    private readonly usersUnblockRepository: UsersUnblockRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE) // default: EVERY_DAY_AT_MIDNIGHT
  async deactivateExpiredBlocks() {
    try {
      const expiredBlocks =
        await this.usersManagementService.getAllActiveExpiredBlockRecords();
      if (expiredBlocks.length === 0) {
        this.logger.log('No expired block records found');
        return;
      }

      for (const block of expiredBlocks) {
        if (block.isActive) {
          try {
            await this.usersManagementService.changeBlockRecordStatus(
              block.id,
              false,
            );

            const user = await this.usersService.getUserById(block.userId);
            const expiredUserBlocks =
              await this.usersManagementService.getAllActiveBlockRecords(
                user.id,
              );
            if (expiredUserBlocks.length <= 0) {
              await this.usersUnblockRepository.unblockUser(user);
              this.logger.log(
                `User #${user.id} unblocked by system after block expiration`,
              );
            }

            this.logger.log(
              `Block record status changed for block #${block.id}`,
            );
          } catch (e) {
            if (e instanceof ConflictException) {
              this.logger.warn(
                `Failed to change status for block #${block.id}: ${e.message}`,
              );
            } else {
              throw e;
            }
          }
        }
      }
      this.logger.log('Block records checked for expiration');
    } catch (e) {
      this.logger.error('Failed to update block records status:', e.message);
    }
  }
}