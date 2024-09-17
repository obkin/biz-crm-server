import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserBlockEntity } from '../entities/user-block.entity';
import { UserUnblockEntity } from '../entities/user-unblock.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersBlockRepository {
  constructor(
    @InjectRepository(UserBlockEntity)
    private readonly usersBlockRepository: Repository<UserBlockEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async blockUser(user: UserEntity): Promise<void> {
    try {
      user.isBlocked = true;
      await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async saveBlockRecord(
    blockRecord: UserBlockEntity,
  ): Promise<UserBlockEntity> {
    try {
      return await this.usersBlockRepository.save(blockRecord);
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockRecordsByUserId(
    userId: number,
  ): Promise<UserBlockEntity[] | undefined> {
    try {
      return await this.usersBlockRepository.find({
        where: { userId },
        order: { blockedAt: 'DESC' },
      });
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockRecords(): Promise<UserBlockEntity[]> {
    try {
      return await this.usersBlockRepository.find();
    } catch (e) {
      throw e;
    }
  }

  async getAllExpiredBlockRecords(): Promise<UserBlockEntity[]> {
    const currentDate = new Date();

    return this.usersBlockRepository
      .createQueryBuilder('block')
      .where('block.blockedAt IS NOT NULL')
      .andWhere('block.blockDuration IS NOT NULL')
      .andWhere(
        "block.blockedAt + INTERVAL '1 minute' * block.blockDuration < :currentDate",
        { currentDate },
      )
      .getMany();
  }

  async getAllActiveExpiredBlockRecords(): Promise<UserBlockEntity[]> {
    try {
      const currentDate = new Date();
      return this.usersBlockRepository
        .createQueryBuilder('block')
        .where('block.blockedAt IS NOT NULL')
        .andWhere('block.blockDuration IS NOT NULL')
        .andWhere(
          "block.blockedAt + INTERVAL '1 minute' * block.blockDuration < :currentDate",
          { currentDate },
        )
        .andWhere('block.isActive = :isActive', { isActive: true })
        .getMany();
    } catch (e) {
      throw e;
    }
  }

  async getBlockRecordById(blockRecordId: number): Promise<UserBlockEntity> {
    try {
      return await this.usersBlockRepository.findOne({
        where: { id: blockRecordId },
      });
    } catch (e) {
      throw e;
    }
  }

  async changeBlockRecordStatus(
    blockRecordId: number,
    isActive: boolean,
  ): Promise<void> {
    try {
      await this.usersBlockRepository.update(blockRecordId, {
        isActive,
      });
    } catch (e) {
      throw e;
    }
  }

  async changeUnblockDate(
    blockRecordId: number,
    unblockAt: string,
  ): Promise<void> {
    try {
      await this.usersBlockRepository.update(blockRecordId, {
        unblockAt,
      });
    } catch (e) {
      throw e;
    }
  }

  async deleteBlockRecord(blockRecord: UserBlockEntity): Promise<void> {
    try {
      await this.usersBlockRepository.remove(blockRecord);
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class UsersUnblockRepository {
  constructor(
    @InjectRepository(UserUnblockEntity)
    private readonly usersUnblockRepository: Repository<UserUnblockEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async unblockUser(user: UserEntity): Promise<void> {
    try {
      user.isBlocked = false;
      await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async saveUnblockingRecord(
    unblockRecord: UserUnblockEntity,
  ): Promise<UserUnblockEntity> {
    try {
      return await this.usersUnblockRepository.save(unblockRecord);
    } catch (e) {
      throw e;
    }
  }

  async getUnblockRecordByUserId(
    userId: number,
  ): Promise<UserUnblockEntity | undefined> {
    try {
      return await this.usersUnblockRepository.findOne({
        where: { user: { id: userId } },
        order: { unblockedAt: 'DESC' },
      });
    } catch (e) {
      throw e;
    }
  }

  async getAllUnblockRecords(): Promise<UserUnblockEntity[]> {
    try {
      return await this.usersUnblockRepository.find();
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class UsersDelitionRepository {
  constructor(
    @InjectRepository(UserDeletionEntity)
    private readonly usersDelitionRepository: Repository<UserDeletionEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async deleteUser(id: number): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async saveDeletionRecord(
    deletionRecord: UserDeletionEntity,
  ): Promise<UserDeletionEntity> {
    try {
      return await this.usersDelitionRepository.save(deletionRecord);
    } catch (e) {
      throw e;
    }
  }

  async getDelitionRecordByUserId(
    userId: number,
  ): Promise<UserDeletionEntity | undefined> {
    try {
      return await this.usersDelitionRepository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllDeletionRecords(): Promise<UserDeletionEntity[]> {
    try {
      return await this.usersDelitionRepository.find();
    } catch (e) {
      throw e;
    }
  }
}
