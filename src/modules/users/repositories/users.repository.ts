import { Injectable } from '@nestjs/common';
import { UserRegisterDto } from '../../auth/dto/user-register.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangeUserNameDto } from '../dto/change-user-name.dto';
import { ChangeUserEmailDto } from '../dto/change-user-email.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const user = this.usersRepository.create(dto);
      return await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async changeUserName(
    user: UserEntity,
    dto: ChangeUserNameDto,
  ): Promise<UserEntity> {
    try {
      user.username = dto.newName;
      return await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async changeUserEmail(
    user: UserEntity,
    dto: ChangeUserEmailDto,
  ): Promise<UserEntity> {
    try {
      user.email = dto.newEmail;
      return await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async changeUserPassword(
    user: UserEntity,
    newPassword: string,
  ): Promise<UserEntity> {
    try {
      user.password = newPassword;
      return await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }

  async getUserById(id: number): Promise<UserEntity> {
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

  async getAllAdmins(): Promise<UserEntity[]> {
    try {
      const query = `
        SELECT * FROM users
        WHERE 'admin' = ANY(roles)
      `;
      return await this.usersRepository.query(query);
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

  // --- User's roles (UMC & UMS) ---

  async saveUser(user: UserEntity): Promise<UserEntity> {
    try {
      return await this.usersRepository.save(user);
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  async checkUserExisting(
    email?: string,
    id?: number,
  ): Promise<UserEntity | undefined> {
    try {
      return email
        ? await this.usersRepository.findOne({ where: { email } })
        : await this.usersRepository.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }
}
