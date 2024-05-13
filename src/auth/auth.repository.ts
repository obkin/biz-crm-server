import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from 'src/auth/entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly userRepository: Repository<RefreshTokenEntity>,
  ) {}

  async createToken(dto: RefreshTokenDto): Promise<RefreshTokenEntity> {
    try {
      const token = this.userRepository.create(dto);
      return await this.userRepository.save(token);
    } catch (e) {
      throw e;
    }
  }

  async findTokenByUserId(
    userId: number,
  ): Promise<RefreshTokenEntity | undefined> {
    try {
      return await this.userRepository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }
}
