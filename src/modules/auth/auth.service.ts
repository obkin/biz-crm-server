import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDto } from 'src/modules/auth/dto/user-register.dto';
import { UsersService } from 'src/modules/users/users.service';
import { genSalt, hash, compare } from 'bcrypt';
import { LoggerService } from 'src/common/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from 'src/modules/auth/dto/user-login.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { addDays } from 'date-fns';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { IUserTokens } from './interfaces';
import { DataSource } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { AccessTokenEntity } from './entities/access-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly loggerService: LoggerService,
    private readonly dataSource: DataSource,
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
      if (!newUser) {
        throw new InternalServerErrorException(
          'User was not created. UsersService did not return UserEntity',
        );
      } else {
        this.loggerService.log(
          `[AuthService] New user registered (user: ${newUser.email} / userId: ${newUser.id})`,
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

  async userLogin(dto: UserLoginDto): Promise<UserLoginResponseDto> {
    try {
      const validatedUser = await this.validateUser(dto);
      if (!validatedUser) {
        throw new BadRequestException('Wrong password');
      }

      const JWTtokens = await this.generateTokens(validatedUser);
      const user = await this.usersService.findByEmail(validatedUser.email);

      await this.saveAccessToken({
        userId: user.id,
        accessToken: JWTtokens.accessToken,
        expiresIn: addDays(new Date(), 1),
      });

      await this.saveRefreshToken({
        userId: user.id,
        refreshToken: JWTtokens.refreshToken,
        expiresIn: addDays(new Date(), 30),
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
      });

      this.loggerService.log(
        `[AuthService] Signed in as user (user: ${user.email} / userId: ${user.id})`,
      );
      return {
        id: validatedUser.id,
        email: validatedUser.email,
        accessToken: JWTtokens.accessToken,
        refreshToken: JWTtokens.refreshToken,
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
      };
    } catch (e) {
      this.loggerService.error(
        `[AuthService] Failed to sign in as user (user: ${dto.email} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async userLogout(userId: number): Promise<void> {
    try {
      await this.deleteAccessToken(userId);
      await this.deleteRefreshToken(userId);
      this.loggerService.log(
        `[AuthService] User logged out (userId: ${userId})`,
      );
    } catch (e) {
      if (e?.status === 404) {
        this.loggerService.error(
          `[AuthService] Failed to logout (userId: ${userId} / error: This user is not logged in)`,
        );
        throw new UnauthorizedException('This user is not logged in');
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
        roles: user.roles,
        iat: Math.floor(Date.now() / 1000),
      };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1m', // change to 24h
      });
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '30d' },
      );
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const userId = Number(decoded.sub);

      const storedToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
      if (!storedToken || storedToken.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          roles: user.roles,
          iat: Math.floor(Date.now() / 1000),
        },
        {
          expiresIn: '1m', // change to 24h
        },
      );

      await this.saveAccessToken({
        userId: user.id,
        accessToken: newAccessToken,
        expiresIn: addDays(new Date(), 1),
      });

      this.loggerService.log(
        `[AuthService] Access token refreshed (userId: ${userId})`,
      );

      return newAccessToken;
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // --- Refresh tokens' logic ---
  async saveRefreshToken(dto: RefreshTokenDto): Promise<RefreshTokenEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingRefreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(
          dto.userId,
          queryRunner.manager,
        );
      if (existingRefreshToken) {
        await this.refreshTokenRepository.deleteRefreshToken(
          dto.userId,
          queryRunner.manager,
        );
      }
      const savedRefreshToken =
        await this.refreshTokenRepository.saveRefreshToken(
          dto,
          queryRunner.manager,
        );
      if (!savedRefreshToken) {
        throw new InternalServerErrorException(
          'Refresh token not saved. RefreshTokenRepository did not return RefreshTokenEntity',
        );
      } else {
        await queryRunner.commitTransaction();
        this.loggerService.log(
          `[AuthService] Refresh token saved (userId: ${dto.userId})`,
        );
        return savedRefreshToken;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.code === '23505') {
        this.loggerService.error(
          `[AuthService] Failed to save refresh token (userId: ${dto.userId} / error: Such refresh token already exists)`,
        );
        throw new ConflictException('Such refresh token already exists');
      } else {
        this.loggerService.error(
          `[AuthService] Failed to save refresh token (userId: ${dto.userId} / error: ${e.message})`,
        );
        throw e;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteRefreshToken(userId);
      this.loggerService.log(
        `[AuthService] Refresh token deleted (userId: ${userId})`,
      );
    } catch (e) {
      this.loggerService.error(
        `[AuthService] Failed to delete refresh token (userId: ${userId} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async getRefreshToken(userId: number): Promise<RefreshTokenEntity> {
    try {
      const refreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
      if (!refreshToken) {
        throw new NotFoundException('Such refresh token not found');
      } else {
        return refreshToken;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllRefreshTokens(): Promise<RefreshTokenEntity[]> {
    try {
      const tokensArray =
        await this.refreshTokenRepository.getAllRefreshTokens();
      if (tokensArray.length === 0) {
        throw new NotFoundException('There are no refresh tokens');
      }
      return tokensArray;
    } catch (e) {
      throw e;
    }
  }

  // --- Access tokens' logic ---
  async saveAccessToken(dto: AccessTokenDto): Promise<AccessTokenEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingAccessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(
          dto.userId,
          queryRunner.manager,
        );
      if (existingAccessToken) {
        await this.accessTokenRepository.deleteAccessToken(
          dto.userId,
          queryRunner.manager,
        );
      }
      const savedAccessToken = await this.accessTokenRepository.saveAccessToken(
        dto,
        queryRunner.manager,
      );
      if (!savedAccessToken) {
        throw new InternalServerErrorException(
          'Access token not saved. AccessTokenRepository did not return AccessTokenEntity',
        );
      } else {
        await queryRunner.commitTransaction();
        this.loggerService.log(
          `[AuthService] Access token saved (userId: ${dto.userId})`,
        );
        return savedAccessToken;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.code === '23505') {
        this.loggerService.error(
          `[AuthService] Failed to save access token (userId: ${dto.userId} / error: Such access token already exists)`,
        );
        throw new ConflictException('Such access token already exists');
      } else {
        this.loggerService.error(
          `[AuthService] Failed to save access token (userId: ${dto.userId} / error: ${e.message})`,
        );
        throw e;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAccessToken(userId: number): Promise<void> {
    try {
      await this.accessTokenRepository.deleteAccessToken(userId);
      this.loggerService.log(
        `[AuthService] Access token deleted (userId: ${userId})`,
      );
    } catch (e) {
      this.loggerService.error(
        `[AuthService] Failed to delete access token (userId: ${userId} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async getAccessToken(userId: number): Promise<AccessTokenEntity> {
    try {
      const accessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(userId);
      if (!accessToken) {
        throw new NotFoundException('Such access token not found');
      } else {
        return accessToken;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllAccessTokens(): Promise<AccessTokenEntity[]> {
    try {
      const tokensArray = await this.accessTokenRepository.getAllAccessTokens();
      if (tokensArray.length === 0) {
        throw new NotFoundException('There are no access tokens');
      }
      return tokensArray;
    } catch (e) {
      throw e;
    }
  }
}
