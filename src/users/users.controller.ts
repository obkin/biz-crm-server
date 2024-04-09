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
import { UsersService } from './users.service';

@Controller('/auth')
export class UsersController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Creating a new user' })
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      if (dto) {
        return this.usersService.register(dto);
      }
    } catch (e) {
      this.loggerService.error(`[UsersController] error: ${e.message}`);
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
