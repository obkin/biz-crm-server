import { ConflictException, Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: UserRegisterDto) {
    try {
      const existingUser = await this.usersRepository.findOneUserByEmail(
        dto.email,
      );
      if (existingUser) {
        throw new Error('Such user already exists');
      }

      const salt = this.configService.get<string>('PASSWORD_SALT');
      const hashedPassword = await hash(dto.password, Number(salt));

      const newUserDto: UserRegisterDto = {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      };

      return await this.usersRepository.createNewUser(newUserDto);
    } catch (e) {
      if (e.message === 'Such user already exists') {
        this.loggerService.error(
          `[UsersService] Error registering user with email ${dto.email}: ${e.message}`,
        );
        throw new ConflictException('Such user already exists');
      } else {
        this.loggerService.error(
          `[UsersService] Error registering user with email ${dto.email}: ${e}`,
        );
        throw e;
      }
    }
  }

  async login(email: string) {
    try {
      if (email) {
        // ...
      }
    } catch (e) {
      throw e;
    }
  }

  async logout() {}
}
