import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  // --- Service logic ---
  async createNewUser(dto: UserRegisterDto): Promise<UserEntity> {
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

  async updateUserName(id: number, dto: UserUpdateDto): Promise<UserEntity> {
    try {
      if (!dto.username) {
        throw new BadRequestException('You can update only username');
      }

      const user = await this.usersRepository.findOneUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.username === dto.username) {
        throw new BadRequestException('Enter a new name');
      }
      return await this.usersRepository.updateUser(id, dto);
    } catch (e) {
      throw e;
    }
  }

  async updateUserEmail(id: number, dto: UserUpdateDto): Promise<UserEntity> {
    try {
      if (!dto.email) {
        throw new BadRequestException('You can update only email');
      }

      const user = await this.usersRepository.findOneUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.email === dto.email) {
        throw new BadRequestException('Enter a new email');
      }
      return await this.usersRepository.updateUser(id, dto);
    } catch (e) {
      throw e;
    }
  }

  async updateUserPassword(
    id: number,
    dto: UserUpdateDto,
  ): Promise<UserEntity> {
    try {
      if (!dto.password) {
        throw new BadRequestException('You can update only password');
      }

      const user = await this.usersRepository.findOneUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // if (user.password === dto.password) {
      //   throw new BadRequestException('Enter a new password');
      // }
      return await this.usersRepository.updateUser(id, dto);
    } catch (e) {
      throw e;
    }
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
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

  async findUserById(id: number): Promise<UserEntity> {
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

  // --- Roles ---

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const role = await this.rolesService.getRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // update user and set the new role
  }

  // async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
  //   const user = await this.usersRepository.findOne(userId, {
  //     relations: ['roles'],
  //   });
  //   if (!user) {
  //     throw new NotFoundException('Користувача не знайдено');
  //   }

  //   await this.rolesService.removeRoleFromUser(userId, roleId); // Делегуємо видалення ролі сервісу RolesService
  // }

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
