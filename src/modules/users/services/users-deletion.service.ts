import { Injectable } from '@nestjs/common';
import { UserDeleteDto } from '../dto/user-delete.dto';
import { UsersDeletionRepository } from '../repositories/users-deletion.repository';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersDeletionService {
  constructor(
    private readonly usersDeletionRepository: UsersDeletionRepository,
  ) {}

  async saveDeletionRecord(
    adminId: number,
    user: UserEntity,
    dto: UserDeleteDto,
    initiatedBySystem: boolean,
  ): Promise<UserDeletionEntity> {
    try {
      const deletionRecord = new UserDeletionEntity();
      deletionRecord.userId = dto.userId;
      deletionRecord.userEmail = user.email;
      deletionRecord.username = user.username;
      deletionRecord.createdAt = user.createdAt;
      deletionRecord.deletedBy = adminId;
      deletionRecord.deletionReason = dto.deletionReason;
      deletionRecord.initiatedBySystem = initiatedBySystem;

      console.log(deletionRecord);
      return await this.usersDeletionRepository.saveDeletionRecord(
        deletionRecord,
      );
    } catch (e) {
      throw e;
    }
  }
}
