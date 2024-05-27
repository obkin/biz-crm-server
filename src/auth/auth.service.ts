import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UsersService } from 'src/users/users.service';
import { genSalt, hash, compare } from 'bcrypt';
import { LoggerService } from 'logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { addDays } from 'date-fns';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { IUserTokens } from './interfaces';

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
  async userRegister(dto: UserRegisterDto): Promise<UserEntity> {
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
      const hashedPassword = await hash(dto.password, salt);
      const newUser = await this.usersService.create({
        ...dto,
        password: hashedPassword,
      });
      if (newUser) {
        this.loggerService.log(
          `[AuthService] New user registered (user: ${dto.email})`,
        );
        return newUser;
      } else {
        throw new InternalServerErrorException(
          '[AuthService] User was not created. UsersService did not return User',
        );
      }
    } catch (e) {
      this.loggerService.error(
        `[AuthService] Failed to register new user (user: ${dto.email} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async userLogin(dto: UserLoginDto): Promise<UserLoginResponseDto> {
    try {
      const validatedUser = await this.validateUser(dto);
      if (!validatedUser) {
        throw new ConflictException('Wrong password');
      }

      const JWTtokens = await this.generateTokens(validatedUser);
      this.loggerService.log(`[AuthService] Signed in as user (${dto.email})`);

      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
        throw new InternalServerErrorException(
          `[AuthService] Such user does not exist (${dto.email})`,
        );
      }

      await this.saveAccessToken({
        userId: user.id,
        accessToken: JWTtokens.accessToken,
        expiresIn: addDays(new Date(), 1),
      });

      await this.saveRefreshToken({
        userId: user.id,
        refreshToken: JWTtokens.refreshToken,
        expiresIn: addDays(new Date(), 30),
        ipAddress: null, // add it
        userAgent: null, // add it
      });

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

  async userLogout(userId: number) {
    try {
      await this.deleteAccessToken(userId);
      await this.deleteRefreshToken(userId);
    } catch (e) {
      if (e.status === 409) {
        throw new ConflictException('This user is not logged in');
      } else {
        this.loggerService.error(
          `[AuthService] Failed to logout (userId: ${userId} / error: ${e.message})`,
        );
        throw e;
      }
    }
  }

  // --- Methods ---
  private async validateUser(dto: UserLoginDto): Promise<UserEntity | null> {
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

  private async verifyPassword(
    password: string,
    user: UserEntity,
  ): Promise<boolean> {
    try {
      return await compare(password, user.password);
    } catch (e) {
      throw e;
    }
  }

  // --- JWT logic ---
  private async generateTokens(user: UserEntity): Promise<IUserTokens> {
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
        await this.deleteRefreshToken(dto.userId);
      }
      const savedRefreshToken =
        await this.refreshTokenRepository.saveRefreshToken(dto);
      if (savedRefreshToken) {
        this.loggerService.log('[AuthService] Refresh token saved');
        return savedRefreshToken;
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
      await this.refreshTokenRepository.deleteRefreshToken(userId);
      this.loggerService.log('[AuthService] Refresh token deleted');
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
      const tokensArray =
        await this.refreshTokenRepository.getAllRefreshTokens();
      if (tokensArray.length === 0) {
        throw new ConflictException('There are no refresh tokens');
      }
      return tokensArray;
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
        await this.deleteAccessToken(dto.userId);
      }
      const savedAccessToken =
        await this.accessTokenRepository.saveAccessToken(dto);
      if (savedAccessToken) {
        this.loggerService.log('[AuthService] Access token saved');
        return savedAccessToken;
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
      await this.accessTokenRepository.deleteAccessToken(userId);
      this.loggerService.log('[AuthService] Access token deleted');
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
      const tokensArray = await this.accessTokenRepository.getAllAccessTokens();
      if (tokensArray.length === 0) {
        throw new ConflictException('There are no access tokens');
      }
      return tokensArray;
    } catch (e) {
      throw e;
    }
  }
}
