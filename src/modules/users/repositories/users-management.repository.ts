import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserBlockEntity } from '../entities/user-block.entity';

@Injectable()
export class UsersBlockRepository {
  constructor(
    @InjectRepository(UserBlockEntity)
    private readonly usersBlockRepository: Repository<UserBlockEntity>,
  ) {}

  async saveBlockRecord(
    blockRecord: UserBlockEntity,
  ): Promise<UserBlockEntity> {
    try {
      return await this.usersBlockRepository.save(blockRecord);
    } catch (e) {
      throw e;
    }
  }

  async getBlockRecordByUserId(
    userId: number,
  ): Promise<UserBlockEntity | undefined> {
    try {
      return await this.usersBlockRepository.findOne({
        where: { user: { id: userId }, isActive: true },
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
export class UsersDelitionRepository {
  constructor(
    @InjectRepository(UserDeletionEntity)
    private readonly usersDelitionRepository: Repository<UserDeletionEntity>,
  ) {}

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
