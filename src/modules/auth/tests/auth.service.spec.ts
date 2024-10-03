import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserRegisterDto } from 'src/modules/auth/dto/user-register.dto';
import { UserLoginDto } from 'src/modules/auth/dto/user-login.dto';
import { AuthService } from '../auth.service';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from '../auth.repository';
import { RedisService } from 'src/modules/redis/redis.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersService = {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findRefreshTokenByUserId: jest.fn(),
    saveRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
  };

  const mockAccessTokenRepository = {
    findAccessTokenByUserId: jest.fn(),
    saveAccessToken: jest.fn(),
    deleteAccessToken: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(),
    del: jest.fn(),
  };

  const user: UserEntity = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    isEmailConfirmed: false,
    roles: [],
    isBlocked: false,
    blockEntries: [],
    unblockEntries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userRegisterDto: UserRegisterDto = {
    username: 'Test',
    email: 'test@example.com',
    password: 'password',
  };

  const userLoginDto: UserLoginDto = {
    email: 'test@example.com',
    password: 'hashedPassword',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(() => {
    authService = new AuthService(
      mockUsersService as unknown as UsersService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
      mockRefreshTokenRepository as unknown as RefreshTokenRepository,
      mockAccessTokenRepository as unknown as AccessTokenRepository,
      {} as any,
      mockRedisService as unknown as RedisService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userRegister', () => {
    it('should successfully register a user', async () => {
      const userDto: UserRegisterDto = {
        username: 'Test',
        email: 'test@example.com',
        password: 'password',
      };

      mockUsersService.createUser.mockResolvedValue(user);

      const result = await authService.userRegister(userDto);

      expect(result).toEqual(user);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(userDto);
    });

    it('should throw InternalServerErrorException if user is not created', async () => {
      mockUsersService.createUser.mockResolvedValue(null);

      await expect(authService.userRegister(userRegisterDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('userLogout', () => {
    it('should successfully log out a user', async () => {
      const userId = 1;

      mockAccessTokenRepository.deleteAccessToken.mockResolvedValue(null);
      mockRefreshTokenRepository.deleteRefreshToken.mockResolvedValue(null);

      await authService.userLogout(userId);

      expect(mockAccessTokenRepository.deleteAccessToken).toHaveBeenCalledWith(
        userId,
      );
      expect(
        mockRefreshTokenRepository.deleteRefreshToken,
      ).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException if user is not logged in', async () => {
      const userId = 1;

      mockAccessTokenRepository.deleteAccessToken.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(authService.userLogout(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Add more tests for other methods...
});
