import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to login: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async logout() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }

  // --- Temporary ---
  @Post('/save-token')
  async saveRefreshToken(@Body() dto: RefreshTokenDto) {
    try {
      return await this.authService.saveRefreshToken(dto);
    } catch (e) {
      throw e;
    }
  }

  @Get('/get-token')
  async getOneRefreshToken(@Body() userId: number) {
    try {
      return await this.authService.getOneRefreshToken(Number(userId));
    } catch (e) {
      throw e;
    }
  }

  @Get('/get-all-tokens')
  async getAllRefreshTokens() {
    try {
      return await this.authService.getAllRefreshTokens();
    } catch (e) {
      throw e;
    }
  }
}
