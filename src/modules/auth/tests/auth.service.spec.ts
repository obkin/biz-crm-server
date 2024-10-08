import {
  BadRequestException,
  ConflictException,
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
import * as bcrypt from 'bcrypt';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AccessTokenDto } from '../dto/access-token.dto';
import { AccessTokenEntity } from '../entities/access-token.entity';

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
    getAllRefreshTokens: jest.fn(),
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

  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: jest.fn(),
  } as any;

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

  const tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
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

  describe('verifyPassword', () => {
    it('should return true if password is correct', async () => {
      const password = 'correctPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { password: hashedPassword };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await (authService as any).verifyPassword(password, user);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });

  // --- JWT logic ---

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      jest
        .spyOn(authService['jwtService'], 'sign')
        .mockReturnValueOnce(tokens.accessToken)
        .mockReturnValueOnce(tokens.refreshToken);

      jest
        .spyOn(authService['configService'], 'get')
        .mockReturnValueOnce('3600')
        .mockReturnValueOnce('86400');

      const result = await (authService as any).generateTokens(user);

      expect(authService['jwtService'].sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          roles: user.roles,
          iat: expect.any(Number),
        }),
        { expiresIn: '3600' },
      );

      expect(authService['jwtService'].sign).toHaveBeenCalledWith(
        { sub: user.id },
        { expiresIn: '86400' },
      );

      expect(result).toEqual(tokens);
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken: string;
    let decodedToken: any;
    let storedToken: RefreshTokenEntity;
    let newAccessToken: string;

    beforeEach(() => {
      refreshToken = 'validRefreshToken';
      decodedToken = { sub: 1 };
      storedToken = {
        id: 1,
        refreshToken,
        userId: 1,
        expiresIn: new Date(),
        ipAddress: '192.168.01',
        userAgent: 'Mozila',
        createdAt: new Date(),
      };
      newAccessToken = 'newAccessToken';
    });

    it('should successfully refresh the access token', async () => {
      jest
        .spyOn(authService['jwtService'], 'verify')
        .mockReturnValue(decodedToken);
      jest
        .spyOn(
          authService['refreshTokenRepository'],
          'findRefreshTokenByUserId',
        )
        .mockResolvedValue(storedToken);
      jest
        .spyOn(authService['usersService'], 'getUserById')
        .mockResolvedValue(user);
      jest
        .spyOn(authService['jwtService'], 'sign')
        .mockReturnValue(newAccessToken);
      jest.spyOn(authService['configService'], 'get').mockReturnValue('3600');
      jest
        .spyOn(authService as any, 'saveAccessToken')
        .mockResolvedValue(undefined);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(authService['jwtService'].verify).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(
        authService['refreshTokenRepository'].findRefreshTokenByUserId,
      ).toHaveBeenCalledWith(user.id);
      expect(authService['usersService'].getUserById).toHaveBeenCalledWith(
        user.id,
      );
      expect(authService['jwtService'].sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          roles: user.roles,
          iat: expect.any(Number),
        }),
        { expiresIn: '3600' },
      );
      expect(result).toBe(newAccessToken);
    });
  });

  // --- Refresh tokens' logic ---

  describe('saveRefreshToken', () => {
    let refreshTokenDto: RefreshTokenDto;
    let savedRefreshToken: RefreshTokenEntity;

    beforeEach(() => {
      refreshTokenDto = {
        userId: 1,
        refreshToken: 'newRefreshToken',
        expiresIn: new Date(),
        ipAddress: '192.168.01',
        userAgent: 'Mozila',
      };
      savedRefreshToken = {
        id: 1,
        refreshToken: 'newRefreshToken',
        userId: 1,
        expiresIn: new Date(),
        createdAt: new Date(),
      };

      jest
        .spyOn(authService['dataSource'], 'createQueryRunner')
        .mockReturnValue(queryRunner);
    });
    it('should save refresh token successfully if no existing token found', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockRefreshTokenRepository, 'saveRefreshToken')
        .mockResolvedValue(savedRefreshToken);

      const result = await authService.saveRefreshToken(refreshTokenDto);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(
        mockRefreshTokenRepository.findRefreshTokenByUserId,
      ).toHaveBeenCalledWith(refreshTokenDto.userId, queryRunner.manager);
      expect(mockRefreshTokenRepository.saveRefreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
        queryRunner.manager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(savedRefreshToken);
    });

    it('should delete existing refresh token before saving a new one', async () => {
      const existingToken = {
        userId: refreshTokenDto.userId,
        refreshToken: 'oldToken',
      };
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(existingToken);
      jest
        .spyOn(mockRefreshTokenRepository, 'deleteRefreshToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(mockRefreshTokenRepository, 'saveRefreshToken')
        .mockResolvedValue(savedRefreshToken);

      const result = await authService.saveRefreshToken(refreshTokenDto);

      expect(
        mockRefreshTokenRepository.findRefreshTokenByUserId,
      ).toHaveBeenCalledWith(refreshTokenDto.userId, queryRunner.manager);
      expect(
        mockRefreshTokenRepository.deleteRefreshToken,
      ).toHaveBeenCalledWith(refreshTokenDto.userId, queryRunner.manager);
      expect(mockRefreshTokenRepository.saveRefreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
        queryRunner.manager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(savedRefreshToken);
    });

    it('should rollback transaction and throw ConflictException if token already exists', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockRefreshTokenRepository, 'saveRefreshToken')
        .mockRejectedValue({ code: '23505' });

      await expect(
        authService.saveRefreshToken(refreshTokenDto),
      ).rejects.toThrow(ConflictException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction and throw error for other exceptions', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockRefreshTokenRepository, 'saveRefreshToken')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        authService.saveRefreshToken(refreshTokenDto),
      ).rejects.toThrow(Error);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if savedRefreshToken is not returned', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockRefreshTokenRepository, 'saveRefreshToken')
        .mockResolvedValue(null);

      await expect(
        authService.saveRefreshToken(refreshTokenDto),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token and log success', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'deleteRefreshToken')
        .mockResolvedValue(undefined);
      jest.spyOn(mockRedisService, 'del').mockResolvedValue(undefined);

      await authService.deleteRefreshToken(1);

      expect(
        mockRefreshTokenRepository.deleteRefreshToken,
      ).toHaveBeenCalledWith(1);
      expect(mockRedisService.del).toHaveBeenCalledWith('refresh_token:1');
    });

    it('should log a warning if deleting refresh token fails', async () => {
      const error = new Error('Failed to delete');
      jest
        .spyOn(mockRefreshTokenRepository, 'deleteRefreshToken')
        .mockRejectedValue(error);

      await expect(authService.deleteRefreshToken(1)).rejects.toThrow(error);
    });
  });

  describe('getRefreshToken', () => {
    it('should return the refresh token if found', async () => {
      const mockToken = {
        userId: 1,
        refreshToken: 'token',
      } as RefreshTokenEntity;
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(mockToken);

      const result = await authService.getRefreshToken(1);

      expect(
        mockRefreshTokenRepository.findRefreshTokenByUserId,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockToken);
    });

    it('should throw NotFoundException if refresh token not found', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'findRefreshTokenByUserId')
        .mockResolvedValue(null);

      await expect(authService.getRefreshToken(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRefreshTokens', () => {
    it('should return all refresh tokens if found', async () => {
      const mockTokensArray = [
        { userId: 1, refreshToken: 'token1' },
        { userId: 2, refreshToken: 'token2' },
      ] as RefreshTokenEntity[];
      jest
        .spyOn(mockRefreshTokenRepository, 'getAllRefreshTokens')
        .mockResolvedValue(mockTokensArray);

      const result = await authService.getAllRefreshTokens();

      expect(mockRefreshTokenRepository.getAllRefreshTokens).toHaveBeenCalled();
      expect(result).toEqual(mockTokensArray);
    });

    it('should throw NotFoundException if no refresh tokens are found', async () => {
      jest
        .spyOn(mockRefreshTokenRepository, 'getAllRefreshTokens')
        .mockResolvedValue([]);

      await expect(authService.getAllRefreshTokens()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- Access tokens' logic ---

  describe('saveAccessToken', () => {
    let accessTokenDto: AccessTokenDto;
    let savedAccessToken: AccessTokenEntity;

    beforeEach(() => {
      accessTokenDto = {
        userId: 1,
        accessToken: 'newToken',
        expiresIn: new Date(),
      };
      savedAccessToken = {
        id: 1,
        accessToken: 'newToken',
        userId: 1,
        expiresIn: new Date(),
        createdAt: new Date(),
      };

      jest
        .spyOn(authService['dataSource'], 'createQueryRunner')
        .mockReturnValue(queryRunner);
    });

    it('should delete existing access token before saving a new one', async () => {
      const existingToken = {
        userId: accessTokenDto.userId,
        token: 'oldToken',
      };
      jest
        .spyOn(mockAccessTokenRepository, 'findAccessTokenByUserId')
        .mockResolvedValue(existingToken);
      jest
        .spyOn(mockAccessTokenRepository, 'deleteAccessToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(mockAccessTokenRepository, 'saveAccessToken')
        .mockResolvedValue(savedAccessToken);

      const result = await authService.saveAccessToken(accessTokenDto);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(
        mockAccessTokenRepository.findAccessTokenByUserId,
      ).toHaveBeenCalledWith(accessTokenDto.userId, queryRunner.manager);
      expect(mockAccessTokenRepository.deleteAccessToken).toHaveBeenCalledWith(
        accessTokenDto.userId,
        queryRunner.manager,
      );
      expect(mockAccessTokenRepository.saveAccessToken).toHaveBeenCalledWith(
        accessTokenDto,
        queryRunner.manager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(savedAccessToken);
    });

    it('should rollback transaction and throw ConflictException if token already exists', async () => {
      jest
        .spyOn(mockAccessTokenRepository, 'findAccessTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockAccessTokenRepository, 'saveAccessToken')
        .mockRejectedValue({ code: '23505' });

      await expect(authService.saveAccessToken(accessTokenDto)).rejects.toThrow(
        ConflictException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction and throw error for other exceptions', async () => {
      jest
        .spyOn(mockAccessTokenRepository, 'findAccessTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockAccessTokenRepository, 'saveAccessToken')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.saveAccessToken(accessTokenDto)).rejects.toThrow(
        Error,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if savedAccessToken is not returned', async () => {
      jest
        .spyOn(mockAccessTokenRepository, 'findAccessTokenByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(mockAccessTokenRepository, 'saveAccessToken')
        .mockResolvedValue(null);

      await expect(authService.saveAccessToken(accessTokenDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
