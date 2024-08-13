import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { ChangeUserNameDto } from './dto/change-user-name.dto';
import { ChangeUserEmailDto } from './dto/change-user-email.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const existingUser = await this.usersRepository.getUserByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with such email already exists');
      }

      const hashedPassword = await this.hashPassword(dto.password);
      const newUser = await this.usersRepository.createUser({
        ...dto,
        password: hashedPassword,
      });

      this.logger.log(
        `New user created (email: ${newUser.email} / userId: ${newUser.id})`,
      );
      return newUser;
    } catch (e) {
      throw e;
    }
  }

  async changeUserName(
    id: number,
    changeUserNameDto: ChangeUserNameDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.username === changeUserNameDto.newName) {
        throw new BadRequestException('Enter a new name');
      }
      const oldName = user.username;
      const userWithNewName = await this.usersRepository.changeUserName(
        user,
        changeUserNameDto,
      );
      this.logger.log(
        `User name changed (userId: ${user.id}, oldName: ${oldName}, newName: ${changeUserNameDto.newName})`,
      );
      return userWithNewName;
    } catch (e) {
      throw e;
    }
  }

  async changeUserEmail(
    id: number,
    chaneUserEmailDto: ChangeUserEmailDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.email === chaneUserEmailDto.newEmail) {
        throw new BadRequestException('Enter a new email');
      }
      const emailTaken = await this.usersRepository.getUserByEmail(
        chaneUserEmailDto.newEmail,
      );
      if (emailTaken) {
        throw new ConflictException('User with such email already exists');
      }
      return await this.usersRepository.changeUserEmail(
        user,
        chaneUserEmailDto,
      );
    } catch (e) {
      throw e;
    }
  }

  async changeUserPassword(
    id: number,
    changeUserPasswordDto: ChangeUserPasswordDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isOldPasswordCorrect = await compare(
        changeUserPasswordDto.oldPassword,
        user.password,
      );
      if (!isOldPasswordCorrect) {
        throw new BadRequestException('Wrong old password');
      }

      if (await compare(changeUserPasswordDto.newPassword, user.password)) {
        throw new BadRequestException('Enter a new password');
      }

      const hashedNewPassword = await this.hashPassword(
        changeUserPasswordDto.newPassword,
      );
      return await this.usersRepository.changeUserPassword(
        user,
        hashedNewPassword,
      );
    } catch (e) {
      throw e;
    }
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.usersRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (await this.checkIsUserAdmin(user.id)) {
      throw new ForbiddenException('This user is admin');
    }
    try {
      this.eventEmitter.emit('auth.userLogout', { userId: id });
      await this.usersRepository.deleteUser(id);
    } catch (e) {
      throw e;
    }
  }

  async blockUser(id: number): Promise<void> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.isBlocked) {
        throw new ConflictException('This user is already blocked');
      }
      if (await this.checkIsUserAdmin(user.id)) {
        throw new ForbiddenException('This user is admin');
      }
      await this.usersRepository.blockUser(user);
    } catch (e) {
      throw e;
    }
  }

  async unblockUser(id: number): Promise<void> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.isBlocked) {
        throw new ConflictException('This user is not blocked');
      }
      await this.usersRepository.unblockUser(user);
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User with such email not found');
      } else {
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async getUserById(id: number): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(id);
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
      const users = await this.usersRepository.getAllUsers();
      if (!users || users.length === 0) {
        throw new NotFoundException('There are no users');
      }
      return users;
    } catch (e) {
      throw e;
    }
  }

  async getAllAdmins(): Promise<UserEntity[]> {
    try {
      const admins = await this.usersRepository.getAllAdmins();
      if (!admins || admins.length === 0) {
        throw new NotFoundException('There are no admins');
      }
      return admins;
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockedUsers(): Promise<UserEntity[]> {
    try {
      const blockedUsers = await this.usersRepository.getAllBlockedUsers();
      if (!blockedUsers || blockedUsers.length === 0) {
        throw new NotFoundException('There are no blocked users');
      }
      return blockedUsers;
    } catch (e) {
      throw e;
    }
  }

  // --- Roles ---

  async assignRoleToUser(userId: number, roleId: number): Promise<UserEntity> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const role = await this.rolesService.getRoleById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (!user.roles.includes(role.name)) {
        user.roles.push(role.name);
      } else {
        throw new ConflictException('Role already assigned to user');
      }
      return await this.usersRepository.saveUser(user);
    } catch (e) {
      throw e;
    }
  }

  async removeRoleFromUser(
    userId: number,
    roleId: number,
  ): Promise<UserEntity> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const role = await this.rolesService.getRoleById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (role.name === 'user') {
        throw new BadRequestException('Cannot remove the <user> role');
      }

      const roleIndex = user.roles.indexOf(role.name);
      if (roleIndex > -1) {
        user.roles.splice(roleIndex, 1);
        return await this.usersRepository.saveUser(user);
      } else {
        throw new ConflictException('User does not have this role');
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

  public async checkIsUserAdmin(id: number): Promise<boolean> {
    try {
      const user = await this.getUserById(id);
      if (user.roles && user.roles.some((role) => role === 'admin')) {
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  }

  public async hashPassword(password: string): Promise<string> {
    try {
      const saltRoundsString = this.configService.get<string>(
        'PASSWORD_SALT_ROUNDS',
      );
      if (!saltRoundsString) {
        throw new InternalServerErrorException(
          '[.env] PASSWORD_SALT_ROUNDS not configured',
        );
      }

      const saltRounds = Number(saltRoundsString);
      if (isNaN(saltRounds)) {
        throw new InternalServerErrorException(
          '[.env] PASSWORD_SALT_ROUNDS must be a valid number',
        );
      }

      const salt = await genSalt(saltRounds);
      return await hash(password, salt);
    } catch (e) {
      throw e;
    }
  }
}
