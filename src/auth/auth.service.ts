import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UsersService } from 'src/users/users.service';
import { hash } from 'bcrypt';
import { LoggerService } from 'logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { compare } from 'bcrypt';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly loggerService: LoggerService,
  ) {}

  // --- Service logic ---
  async userRegister(dto: UserRegisterDto) {
    try {
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
      this.loggerService.error(
        `[AuthService] Failed to register new user (user: ${dto.email} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async userLogin(dto: UserLoginDto) {
    try {
      const validatedUser = await this.validateUser(dto);
      if (!validatedUser) {
        throw new ConflictException('Wrong email or password');
      }

      const JWTtokens = await this.generateTokens(validatedUser);
      this.loggerService.log(`[AuthService] Signed in as user (${dto.email})`);

      return {
        id: validatedUser.id,
        email: validatedUser.email,
        accessToken: JWTtokens.accessToken,
        refreshToken: JWTtokens.refreshToken,
      };
    } catch (e) {
      this.loggerService.error(
        `[AuthService] Failed to sign in as user (user: ${dto.email} / error: ${e.message})`,
      );
      throw e;
    }
  }

  // --- Methods ---
  private async validateUser(dto: UserLoginDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (user && (await this.verifyPassword(dto.password, user))) {
        return user;
      } else {
        return null;
      }
    } catch (e) {
      throw e;
    }
  }

  private async verifyPassword(password: string, user: UserEntity) {
    try {
      return await compare(password, user.password);
    } catch (e) {
      throw e;
    }
  }

  // --- JWT logic ---
  private async generateTokens(user: UserEntity) {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '24h',
      });
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async saveRefreshToken(dto: RefreshTokenDto) {
    try {
      const existingToken = await this.authRepository.findTokenByUserId(
        dto.userId,
      );

      if (existingToken) {
        return existingToken.refreshToken;
      }
      const token = await this.authRepository.createToken(dto);
      return token.refreshToken;
    } catch (e) {
      throw e;
    }
  }

  async getRefreshToken(userId: number) {
    try {
      return await this.authRepository.findTokenByUserId(userId);
    } catch (e) {
      throw e;
    }
  }
}
