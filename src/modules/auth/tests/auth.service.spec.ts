import {
  BadRequestException,
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
import { IUserTokens } from '../interfaces';

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

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    }),
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
      mockDataSource as any,
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

  describe('userLogin', () => {
    beforeEach(() => {
      mockRedisService.getClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(null),
      });
      mockAccessTokenRepository.saveAccessToken.mockResolvedValue({
        id: 1,
        userId: user.id,
        token: 'someAccessToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockRefreshTokenRepository.saveRefreshToken.mockResolvedValue({
        id: 1,
        userId: user.id,
        token: 'someRefreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    it('should successfully log in a user', async () => {
      const tokens: IUserTokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockUsersService.getUserByEmail.mockResolvedValue(user);
      mockJwtService.sign
        .mockReturnValueOnce(tokens.accessToken)
        .mockReturnValueOnce(tokens.refreshToken);
      mockRefreshTokenRepository.findRefreshTokenByUserId.mockResolvedValue(
        null,
      );
      mockAccessTokenRepository.findAccessTokenByUserId.mockResolvedValue(null);

      const validateUserSpy = jest
        .spyOn(authService as any, 'validateUser')
        .mockResolvedValue(user);

      const result = await authService.userLogin(userLoginDto);

      expect(validateUserSpy).toHaveReturned();
      expect(validateUserSpy.mock.results[0].value).resolves.toEqual(user);

      expect(result).toHaveProperty('accessToken', tokens.accessToken);
      expect(result).toHaveProperty('refreshToken', tokens.refreshToken);
      expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
        userLoginDto.email,
      );
    });

    it('should throw BadRequestException if password is wrong', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(user);

      jest.spyOn(authService as any, 'validateUser').mockResolvedValue(null);

      await expect(authService.userLogin(userLoginDto)).rejects.toThrow(
        BadRequestException,
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

  // --- Methods ---

  describe('validateUser', () => {
    it('should return user if email and password are correct', async () => {
      jest.spyOn(authService as any, 'verifyPassword').mockResolvedValue(true);
      mockUsersService.getUserByEmail.mockResolvedValue(user);

      const result = await (authService as any).validateUser(userLoginDto);

      expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
        userLoginDto.email,
      );
      expect(result).toEqual(user);
    });
  });
});
