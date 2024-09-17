import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersManagementService } from 'src/modules/users/services/users-management.service';

@Injectable()
export class ExpiredBlockRecordsUpdaterService {
  private readonly logger = new Logger(ExpiredBlockRecordsUpdaterService.name);

  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES) // default: EVERY_DAY_AT_MIDNIGHT
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
