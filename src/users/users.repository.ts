import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UserEntity } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // --- Service logic ---
  async createNewUser(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const createdUser = this.userRepository.create(dto);
      return await this.userRepository.save(createdUser);
    } catch (e) {
      throw e;
    }
  }

  async findOneUserByEmail(email: string): Promise<UserEntity | undefined> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }

  async findOneUserById(id: number): Promise<UserEntity | undefined> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async getAllExistingUsers(): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find();
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  async checkUserExisting(email: string): Promise<UserEntity | undefined> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }
}
