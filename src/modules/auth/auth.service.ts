import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDto } from 'src/modules/auth/dto/user-register.dto';
import { UsersService } from 'src/modules/users/users.service';
import { compare } from 'bcrypt';
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
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  async userRegister(dto: UserRegisterDto): Promise<UserEntity> {
    try {
      const newUser = await this.usersService.createNewUser(dto);
      if (!newUser) {
        throw new InternalServerErrorException(
          'User was not created. UsersService did not return UserEntity',
        );
      } else {
        this.logger.log(
          `New user registered (user: ${newUser.email} / userId: ${newUser.id})`,
        );
        return newUser;
      }
    } catch (e) {
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
      const user = await this.usersService.getUserByEmail(validatedUser.email);

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

      this.logger.log(
        `Signed in as user (user: ${user.email} / userId: ${user.id})`,
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
      throw e;
    }
  }

  async userLogout(userId: number): Promise<void> {
    try {
      await this.deleteAccessToken(userId);
      await this.deleteRefreshToken(userId);
      this.logger.log(`User logged out (userId: ${userId})`);
    } catch (e) {
      if (e?.status === 404) {
        this.logger.warn(
          `Failed to logout (userId: ${userId} / error: This user is not logged in)`,
        );
        throw new UnauthorizedException('This user is not logged in');
      } else {
        throw e;
      }
    }
  }

  // --- Methods ---
  private async validateUser(dto: UserLoginDto): Promise<UserEntity | null> {
    try {
      const user = await this.usersService.getUserByEmail(dto.email);
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
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      });
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
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
        throw new UnauthorizedException('Invalid refresh token / not found');
      }

      const user = await this.usersService.getUserById(userId);
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
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      );

      await this.saveAccessToken(
        {
          userId: user.id,
          accessToken: newAccessToken,
          expiresIn: addDays(new Date(), 1),
        },
        false,
      );

      this.logger.log(`Access token refreshed (userId: ${userId})`);
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
        this.logger.log(`Refresh token saved (userId: ${dto.userId})`);
        return savedRefreshToken;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.code === '23505') {
        this.logger.warn(
          `Failed to save refresh token (userId: ${dto.userId} / error: Such refresh token already exists)`,
        );
        throw new ConflictException('Such refresh token already exists');
      } else {
        this.logger.error(
          `Failed to save refresh token (userId: ${dto.userId} / error: ${e.message})`,
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
      await this.redisService.del(`refresh_token:${userId}`);
      this.logger.log(`Refresh token deleted (userId: ${userId})`);
    } catch (e) {
      this.logger.warn(
        `Failed to delete refresh token (userId: ${userId} / error: ${e.message})`,
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
  async saveAccessToken(
    dto: AccessTokenDto,
    shouldLog: boolean = true,
  ): Promise<AccessTokenEntity> {
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
        if (shouldLog) {
          this.logger.log(`Access token saved (userId: ${dto.userId})`);
        }
        return savedAccessToken;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e.code === '23505') {
        this.logger.warn(
          `Failed to save access token (userId: ${dto.userId} / error: Such access token already exists)`,
        );
        throw new ConflictException('Such access token already exists');
      } else {
        this.logger.error(
          `Failed to save access token (userId: ${dto.userId} / error: ${e.message})`,
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
      await this.redisService.del(`access_token:${userId}`);
      this.logger.log(`Access token deleted (userId: ${userId})`);
    } catch (e) {
      this.logger.warn(
        `Failed to delete access token (userId: ${userId} / error: ${e.message})`,
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

  // --- Methods ---

  // public async verifyUser(request: Request, accessToken: string) {
  //   const userId = Number(this.getUserIdFromToken(accessToken));
  //   if (!userId) {
  //     throw new ConflictException('There is no userId in token payload');
  //   }

  //   try {
  //     const isUserLoggined = await this.checkIsUserLoggedIn(userId);
  //     if (!isUserLoggined) {
  //       throw new UnauthorizedException('User is not logged in');
  //     }

  //     const payload = this.jwtService.verify(accessToken);
  //     request.user = payload;
  //   } catch (e) {
  //     if (e.name === 'TokenExpiredError') {
  //       const refreshToken = await this.getRefreshToken(userId);
  //       if (!refreshToken) {
  //         throw new UnauthorizedException('Refresh token is missing');
  //       }

  //       try {
  //         const newAccessToken = await this.refreshAccessToken(
  //           refreshToken.refreshToken,
  //         );
  //         request.headers.authorization = `Bearer ${newAccessToken}`;
  //         const payload = this.jwtService.verify(newAccessToken);
  //         request.user = payload;
  //       } catch (refreshError) {
  //         throw new UnauthorizedException('Invalid refresh token');
  //       }
  //     } else {
  //       throw new UnauthorizedException(`Invalid access token: ${e}`);
  //     }
  //   }
  // }

  // private getUserIdFromToken(token: string): number | undefined {
  //   try {
  //     const payload = this.jwtService.decode(token) as any;
  //     return payload.id ? payload.id : undefined;
  //   } catch (e) {
  //     return undefined;
  //   }
  // }

  public async checkIsUserLoggedIn(userId: number): Promise<boolean> {
    try {
      const redisClient = this.redisService.getClient();

      let accessToken = await redisClient.get(`access_token:${userId}`);
      if (!accessToken) {
        this.logger.log(
          'Access token not found in Redis, fetching from database',
        );
        const dbAccessToken =
          await this.accessTokenRepository.findAccessTokenByUserId(userId);
        if (dbAccessToken) {
          accessToken = dbAccessToken.accessToken;
          await redisClient.set(
            `access_token:${userId}`,
            accessToken,
            'EX',
            3600,
          ); // 1h
        } else {
          this.logger.warn('Access token not found in database');
        }
      } else {
        this.logger.log('Access token tooked from Redis');
      }

      let refreshToken = await redisClient.get(`refresh_token:${userId}`);
      if (!refreshToken) {
        this.logger.log(
          'Refresh token not found in Redis, fetching from database',
        );
        const dbRefreshToken =
          await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
        if (dbRefreshToken) {
          refreshToken = dbRefreshToken.refreshToken;
          await redisClient.set(
            `refresh_token:${userId}`,
            refreshToken,
            'EX',
            86400,
          ); // 1 day
        } else {
          this.logger.warn('Refresh token not found in database');
          return false;
        }
      } else {
        this.logger.log('Refresh token tooked from Redis');
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
}
