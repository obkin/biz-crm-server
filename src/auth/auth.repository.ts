import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenEntity } from './entities/access-token.entity';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async saveRefreshToken(dto: RefreshTokenDto): Promise<RefreshTokenEntity> {
    try {
      const token = this.refreshTokenRepository.create(dto);
      return await this.refreshTokenRepository.save(token);
    } catch (e) {
      throw e;
    }
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    try {
      const result = await this.refreshTokenRepository.delete({ userId });
      if (result.affected === 0) {
        throw new ConflictException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findRefreshTokenByUserId(
    userId: number,
  ): Promise<RefreshTokenEntity | undefined> {
    try {
      return await this.refreshTokenRepository.findOne({ where: { userId } });
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

// --- Test ---

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
        throw new ConflictException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findAccessTokenByUserId(
    userId: number,
  ): Promise<AccessTokenEntity | undefined> {
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
