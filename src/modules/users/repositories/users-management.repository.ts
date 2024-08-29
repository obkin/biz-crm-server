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
        where: { user: { id: userId } },
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
