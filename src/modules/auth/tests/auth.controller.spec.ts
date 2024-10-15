import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException, NotFoundException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserRegisterDto } from '../dto/user-register.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { UserLoginResponseDto } from '../dto/user-login-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    userRegister: jest.fn(),
    userLogin: jest.fn(),
    userLogout: jest.fn(),
    saveRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    getAllRefreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    const dto: UserRegisterDto = {
      username: 'Test',
      email: 'test@example.com',
      password: 'Test123',
    };

    it('should successfully register a new user', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockAuthService.userRegister.mockResolvedValue(user);

      const result = await authController.register(dto);
      expect(result).toEqual(user);
      expect(mockAuthService.userRegister).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockAuthService.userRegister.mockRejectedValue(
        new HttpException(
          'User with such email already exists',
          HttpStatus.CONFLICT,
        ),
      );

      await expect(authController.register(dto)).rejects.toThrow(HttpException);
      expect(mockAuthService.userRegister).toHaveBeenCalledWith(dto);
    });

    it('should throw InternalServerError when an unexpected error occurs', async () => {
      mockAuthService.userRegister.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(authController.register(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const dto: UserLoginDto = {
        email: 'test@example.com',
        password: 'Test123',
      };
      const tokens: UserLoginResponseDto = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      } as UserLoginResponseDto;
      mockAuthService.userLogin.mockResolvedValue(tokens);

      const result = await authController.login(dto);
      expect(result).toEqual(tokens);
      expect(mockAuthService.userLogin).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when email or password is wrong', async () => {
      const dto: UserLoginDto = {
        email: 'wrong@example.com',
        password: 'wrongPassword',
      };
      mockAuthService.userLogin.mockRejectedValue(
        new HttpException('Wrong email or password', HttpStatus.BAD_REQUEST),
      );

      await expect(authController.login(dto)).rejects.toThrow(HttpException);
      expect(mockAuthService.userLogin).toHaveBeenCalledWith(dto);
    });

    it('should throw InternalServerError when an unexpected error occurs during login', async () => {
      const dto: UserLoginDto = {
        email: 'test@example.com',
        password: 'Test123',
      };
      mockAuthService.userLogin.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(authController.login(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should successfully log out the user', async () => {
      const mockReq = { user: { id: 1 } } as any;
      mockAuthService.userLogout.mockResolvedValue(undefined);

      const result = await authController.logout(mockReq);
      expect(result).toEqual({ userId: 1, message: 'User logged out' });
      expect(mockAuthService.userLogout).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if the user is not logged in', async () => {
      const mockReq = { user: { id: 1 } } as any;
      mockAuthService.userLogout.mockRejectedValue(
        new HttpException('This user is not logged in', HttpStatus.BAD_REQUEST),
      );

      await expect(authController.logout(mockReq)).rejects.toThrow(
        HttpException,
      );
      expect(mockAuthService.userLogout).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerError when an unexpected error occurs during logout', async () => {
      const mockReq = { user: { id: 1 } } as any;
      mockAuthService.userLogout.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(authController.logout(mockReq)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('saveRefreshToken', () => {
    const dto: RefreshTokenDto = {
      userId: 1,
      refreshToken: 'refresh-token',
      expiresIn: new Date(),
      ipAddress: '192.168.0.1',
      userAgent: 'Mozila',
    };
    const savedRefreshToken = {
      id: 1,
      userId: dto.userId,
      refreshToken: dto.refreshToken,
      expiresIn: dto.expiresIn,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully save refresh token', async () => {
      mockAuthService.saveRefreshToken.mockResolvedValue(savedRefreshToken);

      const result = await authController.saveRefreshToken(dto);
      expect(result).toEqual(savedRefreshToken);
      expect(mockAuthService.saveRefreshToken).toHaveBeenCalledWith(dto);
    });

    it('should throw a BadRequestException if the refresh token already exists', async () => {
      mockAuthService.saveRefreshToken.mockRejectedValue(
        new HttpException(
          'Such refresh token already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(authController.saveRefreshToken(dto)).rejects.toThrow(
        HttpException,
      );
      await expect(authController.saveRefreshToken(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        message: 'Such refresh token already exists',
      });
      expect(mockAuthService.saveRefreshToken).toHaveBeenCalledWith(dto);
    });

    it('should throw an InternalServerError if an unexpected error occurs', async () => {
      mockAuthService.saveRefreshToken.mockRejectedValue(
        new Error('Unexpected Error'),
      );

      await expect(authController.saveRefreshToken(dto)).rejects.toThrow(
        HttpException,
      );
      expect(mockAuthService.saveRefreshToken).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteRefreshToken', () => {
    const userId = 1;

    it('should successfully delete refresh token', async () => {
      mockAuthService.deleteRefreshToken.mockResolvedValue(null);

      const result = await authController.deleteRefreshToken(userId);
      expect(result).toEqual({ userId, message: 'Refresh token deleted' });
      expect(mockAuthService.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });

    it('should throw a NotFoundException if the token is not found', async () => {
      mockAuthService.deleteRefreshToken.mockRejectedValue(
        new HttpException('Token not found', HttpStatus.NOT_FOUND),
      );

      await expect(authController.deleteRefreshToken(userId)).rejects.toThrow(
        HttpException,
      );

      expect(mockAuthService.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });

    it('should throw an InternalServerError for unexpected errors', async () => {
      mockAuthService.deleteRefreshToken.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(authController.deleteRefreshToken(userId)).rejects.toThrow(
        HttpException,
      );

      expect(mockAuthService.deleteRefreshToken).toHaveBeenCalledWith(userId);
    });
  });

  describe('getRefreshToken', () => {
    const userId = 1;
    const mockRefreshToken = {
      id: 1,
      userId: 1,
      refreshToken: 'some-refresh-token',
      expiresIn: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla',
    };

    it('should successfully retrieve the refresh token', async () => {
      mockAuthService.getRefreshToken.mockResolvedValue(mockRefreshToken);

      const result = await authController.getRefreshToken(userId);
      expect(result).toEqual(mockRefreshToken);
      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith(userId);
    });

    it('should throw a NotFoundException if the token is not found', async () => {
      mockAuthService.getRefreshToken.mockRejectedValue(
        new HttpException('Such refresh token not found', HttpStatus.NOT_FOUND),
      );

      await expect(authController.getRefreshToken(userId)).rejects.toThrow(
        HttpException,
      );
      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith(userId);
    });

    it('should throw an InternalServerError for unexpected errors', async () => {
      mockAuthService.getRefreshToken.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(authController.getRefreshToken(userId)).rejects.toThrow(
        HttpException,
      );
      expect(mockAuthService.getRefreshToken).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllRefreshTokens', () => {
    const mockRefreshTokensArray = [
      {
        id: 1,
        userId: 1,
        refreshToken: 'some-refresh-token-1',
        expiresIn: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 2,
        userId: 2,
        refreshToken: 'some-refresh-token-2',
        expiresIn: new Date(),
        ipAddress: '192.168.1.2',
        userAgent: 'Chrome/98.0',
      },
    ];

    it('should successfully retrieve all refresh tokens', async () => {
      mockAuthService.getAllRefreshTokens.mockResolvedValue(
        mockRefreshTokensArray,
      );

      const result = await authController.getAllRefreshTokens();
      expect(result).toEqual({
        tokensAmount: mockRefreshTokensArray.length,
        refreshTokensArray: mockRefreshTokensArray,
      });
      expect(mockAuthService.getAllRefreshTokens).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if no tokens are found', async () => {
      mockAuthService.getAllRefreshTokens.mockRejectedValue(
        new NotFoundException('There are no refresh tokens'),
      );

      await expect(authController.getAllRefreshTokens()).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAuthService.getAllRefreshTokens).toHaveBeenCalled();
    });

    it('should throw an InternalServerError for unexpected errors', async () => {
      mockAuthService.getAllRefreshTokens.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(authController.getAllRefreshTokens()).rejects.toThrow(
        new HttpException(
          'Failed to find all refresh tokens. Error: Unexpected error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(mockAuthService.getAllRefreshTokens).toHaveBeenCalled();
    });
  });
});
