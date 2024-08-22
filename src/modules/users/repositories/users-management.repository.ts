import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeletionEntity } from '../entities/user-deletion.entity';

@Injectable()
export class UsersManagementRepository {
  constructor(
    @InjectRepository(UserDeletionEntity)
    private readonly repository: Repository<UserDeletionEntity>,
  ) {}

  async saveDeletionRecord(
    deletionRecord: UserDeletionEntity,
  ): Promise<UserDeletionEntity> {
    try {
      return await this.repository.save(deletionRecord);
    } catch (e) {
      throw e;
    }
  }

  async getDelitionRecordByUserId(
    userId: number,
  ): Promise<UserDeletionEntity | undefined> {
    try {
      return await this.repository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllDeletionRecords(): Promise<UserDeletionEntity[]> {
    try {
      return await this.repository.find();
    } catch (e) {
      throw e;
    }
  }
}
