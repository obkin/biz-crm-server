import {
  BadRequestException,
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
import { RolesService } from 'src/modules/roles/roles.service';

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
    private readonly rolesService: RolesService,
  ) {}

  // --- User's email ---

  public async updateEmailConfirmationStatus(
    userEmail: string,
    isConfirmed: boolean,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserByEmail(userEmail);
      if (!user) {
        throw new NotFoundException(`User ${userEmail} not found`);
      }

      if (isConfirmed && user.isEmailConfirmed) {
        throw new ConflictException(`User email is already confirmed`);
      }

      if (!isConfirmed && !user.isEmailConfirmed) {
        throw new ConflictException('User email is already unconfirmed');
      }

      return await this.usersRepository.saveUser({
        ...user,
        isEmailConfirmed: isConfirmed,
      });
    } catch (e) {
      throw e;
    }
  }

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
      blockRecord.userId = user.id;
      blockRecord.userEmail = user.email;
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
      return blockRecords;
    } catch (e) {
      throw e;
    }
  }

  async getAllActiveBlockRecords(userId?: number): Promise<UserBlockEntity[]> {
    try {
      let blockRecords: UserBlockEntity[];
      if (userId) {
        blockRecords = await this.getAllBlockRecords(userId);
      } else {
        blockRecords = await this.getAllBlockRecords();
      }
      if (!blockRecords || blockRecords.length === 0) {
        throw new NotFoundException('Active block records not found');
      }
      return blockRecords.filter(
        (record: { isActive: boolean }) => record.isActive,
      );
    } catch (e) {
      throw e;
    }
  }

  async getAllExpiredBlockRecords(): Promise<UserBlockEntity[]> {
    try {
      const blockRecords =
        await this.usersBlockRepository.getAllExpiredBlockRecords();
      if (!blockRecords && blockRecords.length === 0) {
        throw new NotFoundException(`Expired block records not found`);
      }
      return blockRecords;
    } catch (e) {
      throw e;
    }
  }

  async getAllActiveExpiredBlockRecords(): Promise<UserBlockEntity[]> {
    try {
      const blockRecords =
        await this.usersBlockRepository.getAllActiveExpiredBlockRecords();
      if (!blockRecords && blockRecords.length === 0) {
        throw new NotFoundException(`Active expired block records not found`);
      }
      return blockRecords;
    } catch (e) {
      throw e;
    }
  }

  async validateUserBlockStatus(userId: number): Promise<boolean> {
    try {
      const activeBlockRecords = await this.getAllActiveBlockRecords(userId);
      const user = await this.usersService.getUserById(userId);
      const currentDate = new Date();
      let isBlockValid = false;

      for (const record of activeBlockRecords) {
        if (record.unblockAt && record.unblockAt <= currentDate) {
          await this.changeBlockRecordStatus(record.id, false);
          isBlockValid = false;
        } else {
          isBlockValid = true;
        }
      }

      if (!isBlockValid) {
        await this.usersUnblockRepository.unblockUser(user);
      }

      return isBlockValid;
    } catch (e) {
      throw e;
    }
  }

  async countActiveBlocksForUser(userId: number): Promise<number> {
    try {
      const activeBlocks = await this.getAllActiveBlockRecords(userId);
      return activeBlocks.length;
    } catch (e) {
      return 0;
    }
  }

  private calculateUnblockDate(blockDuration: number): Date {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + blockDuration * 60 * 1000);
  }

  // === User's blocking - debug ===

  async getBlockRecordById(blockRecordId: number): Promise<UserBlockEntity> {
    try {
      const blockRecord =
        await this.usersBlockRepository.getBlockRecordById(blockRecordId);
      if (!blockRecord) {
        throw new NotFoundException('Block record not found');
      }
      return blockRecord;
    } catch (e) {
      throw e;
    }
  }

  async changeBlockRecordStatus(
    blockRecordId: number,
    isActive: boolean,
  ): Promise<void> {
    try {
      const blockRecord = await this.getBlockRecordById(blockRecordId);
      if (blockRecord.isActive === isActive) {
        throw new ConflictException(
          `This block record is already ${isActive ? 'active' : 'inactive'}`,
        );
      }
      await this.usersBlockRepository.changeBlockRecordStatus(
        blockRecordId,
        isActive,
      );
    } catch (e) {
      throw e;
    }
  }

  async changeUnblockDate(blockRecordId: number, date: string): Promise<void> {
    try {
      const blockRecord = await this.getBlockRecordById(blockRecordId);
      const newUnblockDate = new Date(date);
      if (
        blockRecord.unblockAt &&
        blockRecord.unblockAt.getTime() === newUnblockDate.getTime()
      ) {
        throw new ConflictException(
          'The new unblock date cannot be the same as the current unblock date',
        );
      }
      await this.usersBlockRepository.changeUnblockDate(blockRecord.id, date);
    } catch (e) {
      throw e;
    }
  }

  async deleteBlockRecord(blockRecordId: number): Promise<void> {
    try {
      const blockRecord = await this.getBlockRecordById(blockRecordId);
      await this.usersBlockRepository.deleteBlockRecord(blockRecord);
    } catch (e) {
      throw e;
    }
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
        await this.saveUnblockRecord(user, dto, admin);
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
    user: UserEntity,
    dto: UserUnblockDto,
    admin: UserEntity,
  ) {
    try {
      const unblockRecord = new UserUnblockEntity();
      unblockRecord.userId = user.id;
      unblockRecord.userEmail = user.email;
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

  async getAllUnblockRecords(userId?: number): Promise<UserUnblockEntity[]> {
    try {
      let unblockRecords: UserUnblockEntity[];
      if (userId) {
        unblockRecords =
          await this.usersUnblockRepository.getAllUnblockRecordsByUserId(
            userId,
          );
      } else {
        unblockRecords =
          await this.usersUnblockRepository.getAllUnblockRecords();
      }
      return unblockRecords;
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

  // --- User's roles ---

  async assignRoleToUser(userId: number, roleId: number): Promise<UserEntity> {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const role = await this.rolesService.getRoleById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (!user.roles.includes(role.name)) {
        user.roles.push(role.name);
      } else {
        throw new ConflictException('Role already assigned to user');
      }
      return await this.usersRepository.saveUser(user);
    } catch (e) {
      throw e;
    }
  }

  async removeRoleFromUser(
    userId: number,
    roleId: number,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const role = await this.rolesService.getRoleById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (role.name === 'user') {
        throw new BadRequestException('Cannot remove the <user> role');
      }

      const roleIndex = user.roles.indexOf(role.name);
      if (roleIndex > -1) {
        user.roles.splice(roleIndex, 1);
        return await this.usersRepository.saveUser(user);
      } else {
        throw new ConflictException('User does not have this role');
      }
    } catch (e) {
      throw e;
    }
  }
}
