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
      await repository.save(token);
      return null;
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
  ): Promise<RefreshTokenEntity | void> {
    const repository = manager
      ? manager.getRepository(RefreshTokenEntity)
      : this.refreshTokenRepository;
    try {
      return await repository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllRefreshTokens() {
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

  async saveAccessToken(dto: AccessTokenDto): Promise<AccessTokenEntity> {
    try {
      const token = this.accessTokenRepository.create(dto);
      return await this.accessTokenRepository.save(token);
    } catch (e) {
      throw e;
    }
  }

  async deleteAccessToken(userId: number): Promise<void> {
    try {
      const result = await this.accessTokenRepository.delete({ userId });
      if (result.affected === 0) {
        throw new NotFoundException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findAccessTokenByUserId(
    userId: number,
  ): Promise<AccessTokenEntity | void> {
    try {
      return await this.accessTokenRepository.findOne({ where: { userId } });
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
