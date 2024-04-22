import { ConflictException, Injectable } from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { LoggerService } from 'logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersRepository: UsersRepository,
  ) {}

  // --- Service logic ---
  async create(dto: UserRegisterDto) {
    try {
      const existingUser = await this.usersRepository.checkUserExisting(
        dto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with such email already exists');
      }

      const newUser = await this.usersRepository.createNewUser(dto);
      if (newUser) {
        this.loggerService.log(
          `[UsersService] New user created (user: ${dto.email})`,
        );
        return newUser;
      } else {
        throw new ConflictException('Failed to create new user');
      }
    } catch (e) {
      this.loggerService.error(
        `[UsersService] Failed to create new user (user: ${dto.email} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.usersRepository.findOneUserByEmail(email);
      if (!user) {
        this.loggerService.error(
          `[UsersService] User with such email not found (${email})`,
        );
        throw new ConflictException('User with such email not found');
      } else {
        this.loggerService.log(
          `[UsersService] Sent info about user (${email})`,
        );
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async findById(id: string) {
    try {
      const user = await this.usersRepository.findOneUserById(id);
      if (!user) {
        this.loggerService.error(
          `[UsersService] User with such id not found (id: ${id})`,
        );
        throw new ConflictException('User with such id not found');
      } else {
        this.loggerService.log(
          `[UsersService] Sent info about user (id: ${id})`,
        );
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.usersRepository.getAllExistingUsers();
      if (!users || users.length === 0) {
        this.loggerService.error(`[UsersService] No users found`);
        throw new ConflictException('No users found');
      } else {
        this.loggerService.log(`[UsersService] Sent all existing users`);
        return users;
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  async checkUserExisting(email: string) {
    try {
      const user = await this.usersRepository.checkUserExisting(email);
      return !!user;
    } catch (e) {
      throw e;
    }
  }
}
