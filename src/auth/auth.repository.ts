import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokensEntity } from 'src/auth/entities/tokens.entity';
import { Repository } from 'typeorm';
import { TokensDto } from './dto/tokens.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(TokensEntity)
    private readonly userRepository: Repository<TokensEntity>,
  ) {}

  async createTokens(dto: TokensDto): Promise<TokensEntity> {
    try {
      const tokens = this.userRepository.create(dto);
      return await this.userRepository.save(tokens);
    } catch (e) {
      throw e;
    }
  }

  async deleteTokens(userId: number): Promise<void> {
    try {
      const result = await this.userRepository.delete({ userId });
      if (result.affected === 0) {
        throw new ConflictException('Tokens not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findTokensByUserId(userId: number): Promise<TokensEntity | undefined> {
    try {
      return await this.userRepository.findOne({ where: { userId } });
    } catch (e) {
      throw e;
    }
  }

  async getAllTokens() {
    try {
      return await this.userRepository.find();
    } catch (e) {
      throw e;
    }
  }
}
