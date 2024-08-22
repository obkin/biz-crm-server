import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeletionEntity } from '../entities/user-deletion.entity';

@Injectable()
export class UsersDeletionRepository {
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
}
