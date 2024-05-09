import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from 'src/entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly userRepository: Repository<TokenEntity>,
  ) {}

  async createToken(dto: TokenEntity): Promise<TokenEntity> {
    // dto is not TokenEntity here! Change it.
    try {
      const token = this.userRepository.create(dto);
      return await this.userRepository.save(token);
    } catch (e) {
      throw e;
    }
  }
}
