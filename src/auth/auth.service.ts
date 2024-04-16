import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDto } from 'src/users/dto/user-register.dto';
import { UsersService } from 'src/users/users.service';
import { hash } from 'bcrypt';
import { LoggerService } from 'logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  async registerUser(dto: UserRegisterDto) {
    try {
      const existingUser = await this.usersService.checkUserExisting(dto.email);
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

      const newUser = await this.usersService.create(newUserDto);
      if (newUser) {
        this.loggerService.log(
          `[AuthService] New user registered (user: ${dto.email})`,
        );
        return newUser;
      }
    } catch (e) {
      throw e;
    }
  }

  async validateUser() {}
}
