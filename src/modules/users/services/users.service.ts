import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto } from '../../auth/dto/user-register.dto';
import { UsersRepository } from '../repositories/users.repository';
import { UserEntity } from '../entities/user.entity';
import { ChangeUserNameDto } from '../dto/change-user-name.dto';
import { ChangeUserEmailDto } from '../dto/change-user-email.dto';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
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
      this.eventEmitter.emit('user.registered', {
        userId: newUser.id,
        email: newUser.email,
      });
      return newUser;
    } catch (e) {
      throw e;
    }
  }

  async changeUserName(
    userId: number,
    changeUserNameDto: ChangeUserNameDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldName = user.username;
      if (oldName === changeUserNameDto.newName) {
        throw new BadRequestException('Enter a new name');
      }
      const updatedUser = await this.usersRepository.changeUserName(
        user,
        changeUserNameDto,
      );
      this.logger.log(
        `User name changed (userId: ${user.id}, oldName: ${oldName}, newName: ${changeUserNameDto.newName})`,
      );
      return updatedUser;
    } catch (e) {
      throw e;
    }
  }

  async changeUserEmail(
    userId: number,
    changeUserEmailDto: ChangeUserEmailDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldEmail = user.email;
      if (oldEmail === changeUserEmailDto.newEmail) {
        throw new BadRequestException('Enter a new email');
      }
      const emailTaken = await this.usersRepository.getUserByEmail(
        changeUserEmailDto.newEmail,
      );
      if (emailTaken) {
        throw new ConflictException('User with such email already exists');
      }
      const updatedUser = await this.usersRepository.changeUserEmail(
        user,
        changeUserEmailDto,
      );
      this.logger.log(
        `User email changed (userId: ${user.id}, oldEmail: ${oldEmail}, newEmail: ${changeUserEmailDto.newEmail})`,
      );
      this.eventEmitter.emit('auth.userLogout', { userId: user.id });
      this.eventEmitter.emit('user.emailChanged', {
        userId: user.id,
        oldEmail: user.email,
        newEmail: changeUserEmailDto.newEmail,
      });
      return updatedUser;
    } catch (e) {
      throw e;
    }
  }

  async changeUserPassword(
    userId: number,
    changeUserPasswordDto: ChangeUserPasswordDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserById(userId);
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
      const updatedUser = await this.usersRepository.changeUserPassword(
        user,
        hashedNewPassword,
      );
      this.logger.log(`User password changed (userId: ${user.id})`);
      this.eventEmitter.emit('auth.userLogout', { userId: user.id });
      return updatedUser;
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.getUserByEmail(email);
      if (!user) {
        this.logger.warn(`User '${email})' not found`);
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
        this.logger.warn(`User #${id} not found`);
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
      return await this.usersRepository.getAllUsers();
    } catch (e) {
      throw e;
    }
  }

  async getAllAdmins(): Promise<UserEntity[]> {
    try {
      return await this.usersRepository.getAllAdmins();
    } catch (e) {
      throw e;
    }
  }

  async getAllBlockedUsers(): Promise<UserEntity[]> {
    try {
      return await this.usersRepository.getAllBlockedUsers();
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
      return user.roles?.some((role) => role === 'admin') || false;
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
