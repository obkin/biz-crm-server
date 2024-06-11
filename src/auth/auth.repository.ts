import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenEntity } from './entities/access-token.entity';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async saveRefreshToken(
    dto: RefreshTokenDto,
    manager?: EntityManager,
  ): Promise<RefreshTokenEntity> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    try {
      const token = repository.create(dto);
      return await repository.save(token);
    } catch (e) {
      throw e;
    }
  }

  async deleteRefreshToken(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    try {
      const result = await repository.delete({ userId });
      if (result.affected === 0) {
        throw new NotFoundException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findRefreshTokenByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<RefreshTokenEntity> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    try {
      return await repository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllRefreshTokens(): Promise<RefreshTokenEntity[]> {
    try {
      return await this.refreshTokenRepository.find();
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class AccessTokenRepository {
  constructor(
    @InjectRepository(AccessTokenEntity)
    private readonly accessTokenRepository: Repository<AccessTokenEntity>,
  ) {}

  async saveAccessToken(
    dto: AccessTokenDto,
    manager?: EntityManager,
  ): Promise<AccessTokenEntity> {
    const repository = manager
      ? manager.getRepository(AccessTokenEntity)
      : this.accessTokenRepository;
    try {
      const token = repository.create(dto);
      return await repository.save(token);
    } catch (e) {
      throw e;
    }
  }

  async deleteAccessToken(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(AccessTokenEntity)
      : this.accessTokenRepository;
    try {
      const result = await repository.delete({ userId });
      if (result.affected === 0) {
        throw new NotFoundException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findAccessTokenByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<AccessTokenEntity> {
    const repository = manager
      ? manager.getRepository(AccessTokenEntity)
      : this.accessTokenRepository;
    try {
      return await repository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllAccessTokens() {
    try {
      return await this.accessTokenRepository.find();
    } catch (e) {
      throw e;
    }
  }
}
