import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoggerService } from 'logger/logger.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: UserEntity })
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      return await this.authService.userRegister(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to create new user: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Login as user' })
  @ApiResponse({ status: 200, type: UserLoginResponseDto })
  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: UserLoginDto) {
    try {
      return await this.authService.userLogin(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to login: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('/logout')
  async logout() {
    try {
      // user's tokens deleting logic (need to add)
      return { message: 'User logged out successfully' };
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to logout: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to logout: ${e.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- Refresh tokens logic (for Admins only) ---
  @Post('/save-refresh-token')
  async saveRefreshToken(@Body() dto: RefreshTokenDto) {
    try {
      return await this.authService.saveRefreshToken(dto);
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to save refresh token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to save refresh token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete('/delete-refresh-token')
  async deleteRefreshToken(@Query('userId') userId: number) {
    try {
      await this.authService.deleteRefreshToken(Number(userId));
      return { userId, message: 'Refresh token deleted successfully' };
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to delete refresh token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to delete refresh token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/get-refresh-token')
  async getRefreshToken(@Query('userId') userId: number) {
    try {
      return await this.authService.getRefreshToken(Number(userId));
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to get refresh token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find refresh token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/get-all-refresh-tokens')
  async getAllRefreshTokens() {
    try {
      return await this.authService.getAllRefreshTokens();
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to get all refresh tokens: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find all refresh tokens: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- Access tokens logic (for Admins only) ---
  @Post('/save-access-token')
  async saveAccessToken(@Body() dto: AccessTokenDto) {
    try {
      return await this.authService.saveAccessToken(dto);
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to save access token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to save access token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete('/delete-access-token')
  async deleteAccessToken(@Query('userId') userId: number) {
    try {
      await this.authService.deleteAccessToken(Number(userId));
      return { userId, message: 'Access token deleted successfully' };
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to delete access token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          `Failed to delete access token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/get-access-token')
  async getAccessToken(@Query('userId') userId: number) {
    try {
      return await this.authService.getAccessToken(Number(userId));
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to get access token: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find access token: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/get-all-access-tokens')
  async getAllAccessTokens() {
    try {
      return await this.authService.getAllAccessTokens();
    } catch (e) {
      this.loggerService.error(
        `[AuthController] Failed to get all access tokens: ${e.message}`,
        e.stack,
      );
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find all access tokens: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
