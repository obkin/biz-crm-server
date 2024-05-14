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
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
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

  // --- Refresh tokens' logic ---
  async saveRefreshToken(dto: RefreshTokenDto) {
    try {
      const existingRefreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(dto.userId);
      if (existingRefreshToken) {
        throw new ConflictException('Such refresh token already saved');
      } else {
        return await this.refreshTokenRepository.saveRefreshToken(dto);
      }
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('Such refresh token already exists');
      } else {
        throw e;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteRefreshToken(userId: number) {
    try {
      return await this.refreshTokenRepository.deleteRefreshToken(userId);
    } catch (e) {
      throw e;
    }
  }

  async getRefreshToken(userId: number) {
    try {
      const refreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
      if (!refreshToken) {
        throw new ConflictException('Such refresh token not found');
      } else {
        return refreshToken;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllRefreshTokens() {
    try {
      return await this.refreshTokenRepository.getAllRefreshTokens();
    } catch (e) {
      throw e;
    }
  }

  // --- Access tokens' logic ---
  async saveAccessToken(dto: AccessTokenDto) {
    try {
      const existingAccessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(dto.userId);
      if (existingAccessToken) {
        throw new ConflictException('Such access token already saved');
      } else {
        return await this.accessTokenRepository.saveAccessToken(dto);
      }
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('Such access token already exists');
      } else {
        throw e;
      }
    }
  }

  async deleteAccessToken(userId: number) {
    try {
      return await this.accessTokenRepository.deleteAccessToken(userId);
    } catch (e) {
      throw e;
    }
  }

  async getAccessToken(userId: number) {
    try {
      const accessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(userId);
      if (!accessToken) {
        throw new ConflictException('Such access token not found');
      } else {
        return accessToken;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllAccessTokens() {
    try {
      return await this.accessTokenRepository.getAllAccessTokens();
    } catch (e) {
      throw e;
    }
  }
}
