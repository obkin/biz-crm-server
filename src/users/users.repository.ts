import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // --- Service logic ---
  async createNewUser(dto: UserRegisterDto): Promise<User> {
    try {
      const createdUser = this.userRepository.create(dto);
      return await this.userRepository.save(createdUser);
    } catch (e) {
      throw e;
    }
  }

  async findOneUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }

  async findOneUserById(id: number): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async getAllExistingUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  async checkUserExisting(email: string): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }
}
