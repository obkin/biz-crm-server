import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserDeleteDto } from '../dto/user-delete.dto';
import { UsersRepository } from '../repositories/users.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UsersBlockRepository,
  UsersDelitionRepository,
  UsersUnblockRepository,
} from '../repositories/users-management.repository';
import { UserBlockDto } from '../dto/user-block.dto';
import { UserBlockEntity } from '../entities/user-block.entity';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UserUnblockDto } from '../dto/user-unblock.dto';
import { UserUnblockEntity } from '../entities/user-unblock.entity';

@Injectable()
export class UsersManagementService {
  private readonly logger = new Logger(UsersManagementService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly usersBlockRepository: UsersBlockRepository,
    private readonly usersUnblockRepository: UsersUnblockRepository,
    private readonly usersDelitionRepository: UsersDelitionRepository,
  ) {}

  // --- User's blocking ---

  async blockUser(admin: UserEntity, dto: UserBlockDto): Promise<void> {
    try {
      const user = await this.usersService.getUserById(dto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.isBlocked) {
        throw new ConflictException('This user is already blocked');
      }
      if (await this.usersService.checkIsUserAdmin(user.id)) {
        throw new ForbiddenException('This user is admin');
      }
      await this.usersBlockRepository.blockUser(user);
      await this.saveBlockRecord(admin, user, dto);
      this.logger.log(
        `User successfully blocked (userId: ${user.id}, email: ${user.email})`,
      );
      this.logger.log(`Blocked by: ${admin.email} (adminId: ${admin.id})`);
    } catch (e) {
      throw e;
    }
  }

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
      blockRecord.unblockAt = this.calculateUnblockDate(dto.blockDuration);

      blockRecord.adminId = admin.id;
      blockRecord.adminEmail = admin.email;

      const newBlockRecord =
        await this.usersBlockRepository.saveBlockRecord(blockRecord);
      this.logger.log(
        `Saved new block record (adminId: ${admin.id}, userId: ${user.id})`,
      );
      return newBlockRecord;
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockRecords(userId?: number): Promise<UserBlockEntity[]> {
    try {
      let blockRecords: UserBlockEntity[];
      if (userId) {
        blockRecords =
          await this.usersBlockRepository.getAllBlockRecordsByUserId(userId);
      } else {
        blockRecords = await this.usersBlockRepository.getAllBlockRecords();
      }
      if (!blockRecords || blockRecords.length === 0) {
        throw new NotFoundException('Block records not found');
      } else {
        return blockRecords;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllActiveBlockRecords(userId: number): Promise<UserBlockEntity[]> {
    try {
      const blockRecords = await this.getAllBlockRecords(userId);
      return blockRecords.filter(
        (record: { isActive: boolean }) => record.isActive,
      );
    } catch (e) {
      throw e;
    }
  }

  async isBlockStillValid(userId: number): Promise<boolean> {
    try {
      const activeBlockRecords = await this.getAllActiveBlockRecords(userId);
      const currentDate = new Date();
      return activeBlockRecords.some((record) => {
        if (record.unblockAt) {
          return record.unblockAt > currentDate;
        }
        return true;
      });
    } catch (e) {
      throw e;
    }
  }

  private calculateUnblockDate(blockDuration: number): Date {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + blockDuration * 60 * 60 * 1000);
  }

  // --- User's unblocking ---

  async unblockUser(admin: UserEntity, dto: UserUnblockDto): Promise<void> {
    try {
      const user = await this.usersService.getUserById(dto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.isBlocked) {
        throw new ConflictException('This user is not blocked');
      }
      await this.usersUnblockRepository.unblockUser(user);
      if (dto.unblockReason || dto.notes) {
        await this.saveUnblockRecord(admin, user, dto);
      }
      this.logger.log(
        `User successfully unblocked (userId: ${user.id}, email: ${user.email}, adminId: ${admin.id})`,
      );
      this.logger.log(`Unblocked by: ${admin.email} (adminId: ${admin.id})`);
    } catch (e) {
      throw e;
    }
  }

  async saveUnblockRecord(
    admin: UserEntity,
    user: UserEntity,
    dto: UserUnblockDto,
  ) {
    try {
      const unblockRecord = new UserUnblockEntity();
      unblockRecord.user = user;
      unblockRecord.unblockReason = dto.unblockReason;
      unblockRecord.notes = dto.notes;

      unblockRecord.adminId = admin.id;
      unblockRecord.adminEmail = admin.email;

      const newUnblockEntity =
        await this.usersUnblockRepository.saveUnblockingRecord(unblockRecord);
      this.logger.log(
        `Saved new unblock record (adminId: ${admin.id}, userId: ${user.id})`,
      );
      return newUnblockEntity;
    } catch (e) {
      throw e;
    }
  }

  async getUnblockRecordByUserId(userId: number): Promise<UserUnblockEntity> {
    try {
      const unblockRecord =
        await this.usersUnblockRepository.getUnblockRecordByUserId(userId);
      if (!unblockRecord) {
        throw new NotFoundException('Unblocking record not found');
      } else {
        return unblockRecord;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllUnblockRecords(): Promise<UserUnblockEntity[]> {
    try {
      const unblockRecords =
        await this.usersUnblockRepository.getAllUnblockRecords();
      if (!unblockRecords || unblockRecords.length === 0) {
        throw new NotFoundException('Unblock records not found');
      } else {
        return unblockRecords;
      }
    } catch (e) {
      throw e;
    }
  }

  // --- User's deleting ---

  async deleteUser(admin: UserEntity, dto: UserDeleteDto): Promise<void> {
    try {
      const user = await this.usersRepository.getUserById(dto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (await this.usersService.checkIsUserAdmin(user.id)) {
        throw new ForbiddenException('This user is admin');
      }
      this.eventEmitter.emit('auth.userLogout', { userId: user.id });
      await this.usersDelitionRepository.deleteUser(user.id);
      await this.saveDeletionRecord(admin, user, dto);
      this.logger.log(
        `User successfully deleted (userId: ${user.id}, email: ${user.email})`,
      );
    } catch (e) {
      throw e;
    }
  }

  async saveDeletionRecord(
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

      const newDeletionRecord =
        await this.usersDelitionRepository.saveDeletionRecord(deletionRecord);
      this.logger.log(
        `Saved new deletion record (adminId: ${admin.id}, userId: ${user.id})`,
      );
      return newDeletionRecord;
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
      if (!deletionRecords || deletionRecords.length === 0) {
        throw new NotFoundException('Deletion records not found');
      } else {
        return deletionRecords;
      }
    } catch (e) {
      throw e;
    }
  }
}
