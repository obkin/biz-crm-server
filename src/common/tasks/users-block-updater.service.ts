import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersManagementService } from 'src/modules/users/services/users-management.service';

@Injectable()
export class BlockStatusUpdaterService {
  private readonly logger = new Logger(BlockStatusUpdaterService.name);

  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleCron() {
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
      this.logger.log('Block records checked for expiration'); // do you need it??
    } catch (e) {
      this.logger.error('Failed to update block records status:', e.message);
    }
  }
}
