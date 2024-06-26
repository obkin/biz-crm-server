import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // --- Service logic ---
  async create(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const existingUser = await this.usersRepository.checkUserExisting(
        dto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with such email already exists');
      } else {
        return await this.usersRepository.createNewUser(dto);
      }
    } catch (e) {
      throw e;
    }
  }

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User with such email not found');
      } else {
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async findById(id: number): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneUserById(id);
      if (!user) {
        throw new NotFoundException('User with such id not found');
      } else {
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(): Promise<UserEntity[]> {
    try {
      const users = await this.usersRepository.getAllExistingUsers();
      if (!users || users.length === 0) {
        throw new NotFoundException('No users found');
      } else {
        return users;
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  public async checkUserExisting(email: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.checkUserExisting(email);
      return !!user;
    } catch (e) {
      throw e;
    }
  }
}
