import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserRegisterDto } from '../dto/user-register.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { UserLoginResponseDto } from '../dto/user-login-response.dto';

describe('AuthController', () => {
  let authController: AuthController;
  //   let authService: AuthService;

  const mockAuthService = {
    userRegister: jest.fn(),
    userLogin: jest.fn(),
    userLogout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    // authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const dto: UserRegisterDto = {
        username: 'Test',
        email: 'test@example.com',
        password: 'Test123',
      };
      const user = { id: 1, email: 'test@example.com' };
      mockAuthService.userRegister.mockResolvedValue(user);

      const result = await authController.register(dto);
      expect(result).toEqual(user);
      expect(mockAuthService.userRegister).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException when user already exists', async () => {
      const dto: UserRegisterDto = {
        username: 'Test',
        email: 'test@example.com',
        password: 'Test123',
      };
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
      const dto: UserRegisterDto = {
        username: 'Test',
        email: 'test@example.com',
        password: 'Test123',
      };
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
});
