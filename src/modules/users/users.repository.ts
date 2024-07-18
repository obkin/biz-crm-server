import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  // --- Service logic ---
  async createNewUser(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const createdUser = this.usersRepository.create(dto);
      return await this.usersRepository.save(createdUser);
    } catch (e) {
      throw e;
    }
  }

  async updateUser(id: number, dto: UserUpdateDto): Promise<UserEntity> {
    try {
      await this.usersRepository.update(id, dto);
      const updatedUser = await this.usersRepository.findOne({ where: { id } });
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (e) {
      throw e;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async blockUser(user: UserEntity): Promise<void> {
    try {
      user.isBlocked = true;
      await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async unblockUser(user: UserEntity): Promise<void> {
    try {
      user.isBlocked = false;
      await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity | undefined> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }

  async getUserById(id: number): Promise<UserEntity | undefined> {
    try {
      return await this.usersRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(): Promise<UserEntity[]> {
    try {
      return await this.usersRepository.find();
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockedUsers(): Promise<UserEntity[]> {
    try {
      return await this.usersRepository.find({ where: { isBlocked: true } });
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  async checkUserExisting(email: string): Promise<UserEntity | undefined> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }
}
