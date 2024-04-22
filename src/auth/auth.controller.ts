import {
  Body,
  ConflictException,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      return await this.authService.userRegister(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to create new user`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto) {
    try {
      return await this.authService.userLogin(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to login`,
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
}
