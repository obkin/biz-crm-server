import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiOperation } from '@nestjs/swagger';
import { LoggerService } from 'logger/logger.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly loggerService: LoggerService) {}

  @ApiOperation({ summary: 'Creating a new user' })
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      if (dto) {
        this.loggerService.log(`[AuthController] register - ok`);
        return 'ok';
      }
    } catch (e) {
      this.loggerService.error(`[AuthController] error: ${e.message}`);
      throw new HttpException(
        'Failed to create a new user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'User authorization' })
  @Post('/login')
  async login() {}

  @ApiOperation({ summary: 'Logging out of the system' })
  @Post('/logout')
  async loguot() {}
}
