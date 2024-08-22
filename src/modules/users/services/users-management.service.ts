import { Injectable } from '@nestjs/common';
import { UserDeleteDto } from '../dto/user-delete.dto';
import { UsersManagementRepository } from '../repositories/users-management.repository';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersManagementService {
  constructor(
    private readonly usersManagementRepository: UsersManagementRepository,
  ) {}

  // --- User's blocking ---

  // --- User's deleting ---

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
      return await this.usersManagementRepository.saveDeletionRecord(
        deletionRecord,
      );
    } catch (e) {
      throw e;
    }
  }

  async getDelitionRecordByUserId(userId: number): Promise<UserDeletionEntity> {
    try {
      return await this.usersManagementRepository.getDelitionRecordByUserId(
        userId,
      );
    } catch (e) {
      throw e;
    }
  }

  async getAllDeletionRecords(): Promise<UserDeletionEntity[]> {
    try {
      return await this.usersManagementRepository.getAllDeletionRecords();
    } catch (e) {
      throw e;
    }
  }
}
