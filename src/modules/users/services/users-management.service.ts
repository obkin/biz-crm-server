import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDeleteDto } from '../dto/user-delete.dto';
import {
  UsersBlockRepository,
  UsersDelitionRepository,
} from '../repositories/users-management.repository';
import { UserBlockDto } from '../dto/user-block.dto';
import { UserBlockEntity } from '../entities/user-block.entity';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersManagementService {
  constructor(
    private readonly usersBlockRepository: UsersBlockRepository,
    private readonly usersDelitionRepository: UsersDelitionRepository,
  ) {}

  // --- User's blocking ---

  async saveBlockRecord(
    admin: UserEntity,
    user: UserEntity,
    dto: UserBlockDto,
  ): Promise<UserBlockEntity> {
    try {
      const blockRecord = new UserBlockEntity();
      blockRecord.user = user;
      blockRecord.blockReason = dto.blockReason;
      blockRecord.notes = dto.notes;
      blockRecord.isActive = true;
      blockRecord.blockDuration = dto.blockDuration;
      blockRecord.unblockedAt = this.calculateUnblockDate(dto.blockDuration);

      blockRecord.adminId = admin.id;
      blockRecord.adminEmail = admin.email;

      return await this.usersBlockRepository.saveBlockRecord(blockRecord);
    } catch (e) {
      throw e;
    }
  }

  async getBlockRecordByUserId(userId: number): Promise<UserBlockEntity> {
    try {
      const blockRecord =
        await this.usersBlockRepository.getBlockRecordByUserId(userId);
      if (!blockRecord) {
        throw new NotFoundException('Block record not found');
      } else {
        return blockRecord;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockRecords(): Promise<UserBlockEntity[]> {
    try {
      const blockRecords = await this.usersBlockRepository.getAllBlockRecords();
      if (!blockRecords) {
        throw new NotFoundException('Block records not found');
      } else {
        return blockRecords;
      }
    } catch (e) {
      throw e;
    }
  }

  private calculateUnblockDate(blockDuration: number): Date {
    const currentDate = new Date();
    return new Date(
      currentDate.getTime() + blockDuration * 24 * 60 * 60 * 1000,
    );
  }

  // --- User's deleting ---

  public async saveDeletionRecord(
    admin: UserEntity,
    user: UserEntity,
    dto: UserDeleteDto,
  ): Promise<UserDeletionEntity> {
    try {
      const deletionRecord = new UserDeletionEntity();
      deletionRecord.userId = dto.userId;
      deletionRecord.userEmail = user.email;
      deletionRecord.username = user.username;
      deletionRecord.deletionReason = dto.deletionReason;
      deletionRecord.createdAt = user.createdAt;

      deletionRecord.adminId = admin.id;
      deletionRecord.adminEmail = admin.email;

      return await this.usersDelitionRepository.saveDeletionRecord(
        deletionRecord,
      );
    } catch (e) {
      throw e;
    }
  }

  async getDelitionRecordByUserId(userId: number): Promise<UserDeletionEntity> {
    try {
      const deletionRecord =
        await this.usersDelitionRepository.getDelitionRecordByUserId(userId);
      if (!deletionRecord) {
        throw new NotFoundException('Deletion record not found');
      } else {
        return deletionRecord;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllDeletionRecords(): Promise<UserDeletionEntity[]> {
    try {
      const deletionRecords =
        await this.usersDelitionRepository.getAllDeletionRecords();
      if (!deletionRecords) {
        throw new NotFoundException('Deletion records not found');
      } else {
        return deletionRecords;
      }
    } catch (e) {
      throw e;
    }
  }
}
