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
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoggerService } from 'logger/logger.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { AccessTokenEntity } from './entities/access-token.entity';
import { UserIdValidationPipe } from 'src/pipes/validate-userId.pipe';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'New user registered',
    type: UserEntity,
  })
  @ApiResponse({
    status: 409,
    description: 'User with such email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Signed in as user',
    type: UserLoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong email or password',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
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

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User logged out',
  })
  @ApiResponse({
    status: 400,
    description: 'This user is not logged in',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @UsePipes(new UserIdValidationPipe())
  @Delete('/logout')
  async logout(@Query('userId') userId: number) {
    try {
      await this.authService.userLogout(Number(userId));
      return { userId, message: 'User logged out' };
    } catch (e) {
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
  @ApiOperation({ summary: 'Save refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Refresh token saved',
  })
  @ApiResponse({
    status: 400,
    description: 'Such refresh token already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Post('/save-refresh-token')
  async saveRefreshToken(@Body() dto: RefreshTokenDto) {
    try {
      return await this.authService.saveRefreshToken(dto);
    } catch (e) {
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

  @ApiOperation({ summary: 'Delete refresh token' })
  @ApiResponse({
    status: 204,
    description: 'Refresh token deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Token not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @HttpCode(204)
  @Delete('/delete-refresh-token')
  async deleteRefreshToken(@Query('userId') userId: number) {
    try {
      await this.authService.deleteRefreshToken(Number(userId));
      return { userId, message: 'Refresh token deleted' };
    } catch (e) {
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

  @ApiOperation({ summary: 'Get refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Refresh token retrieved',
    type: RefreshTokenEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Such refresh token not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @Get('/get-refresh-token')
  async getRefreshToken(@Query('userId') userId: number) {
    try {
      return await this.authService.getRefreshToken(Number(userId));
    } catch (e) {
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

  @ApiOperation({ summary: 'Get all refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all refresh tokens',
    type: [RefreshTokenEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'There are no refresh tokens',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-refresh-tokens')
  async getAllRefreshTokens() {
    try {
      return await this.authService.getAllRefreshTokens();
    } catch (e) {
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
  @ApiOperation({ summary: 'Save access token' })
  @ApiResponse({
    status: 201,
    description: 'Access token saved',
  })
  @ApiResponse({
    status: 400,
    description: 'Such access token already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Post('/save-access-token')
  async saveAccessToken(@Body() dto: AccessTokenDto) {
    try {
      return await this.authService.saveAccessToken(dto);
    } catch (e) {
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

  @ApiOperation({ summary: 'Delete access token' })
  @ApiResponse({
    status: 204,
    description: 'Access token deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Token not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @HttpCode(204)
  @Delete('/delete-access-token')
  async deleteAccessToken(@Query('userId') userId: number) {
    try {
      await this.authService.deleteAccessToken(Number(userId));
      return { userId, message: 'Access token deleted' };
    } catch (e) {
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

  @ApiOperation({ summary: 'Get access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token retrieved',
    type: AccessTokenEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Such access token not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user' })
  @Get('/get-access-token')
  async getAccessToken(@Query('userId') userId: number) {
    try {
      return await this.authService.getAccessToken(Number(userId));
    } catch (e) {
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

  @ApiOperation({ summary: 'Get all access tokens' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all access tokens',
    type: [AccessTokenEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'There are no access tokens',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-access-tokens')
  async getAllAccessTokens() {
    try {
      return await this.authService.getAllAccessTokens();
    } catch (e) {
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
