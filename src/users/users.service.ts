import { ConflictException, Injectable } from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UsersRepository } from './users.repository';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'logger/logger.service';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: UserRegisterDto) {
    try {
      const existingUser = await this.usersRepository.findOneUserByEmail(
        dto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with such email already exists');
      }

      const salt = this.configService.get<string>('PASSWORD_SALT');
      const hashedPassword = await hash(dto.password, Number(salt));

      const newUserDto: UserRegisterDto = {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      };

      const newUser = await this.usersRepository.createNewUser(newUserDto);
      if (newUser) {
        this.loggerService.log(
          `[UsersService] New user registered (user: ${dto.email})`,
        );
        return newUser;
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
}
