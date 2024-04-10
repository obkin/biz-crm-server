import {
  BadRequestException,
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

@Controller('/users')
export class UsersController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Creating a new user' })
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      const registeredUser = await this.usersService.register(dto);
      if (registeredUser) {
        this.loggerService.log(
          `[UsersController] New user registered: ${dto.email}`,
        );
        return registeredUser;
      }
    } catch (e) {
      this.loggerService.error(`[UsersController] error: ${e.message}`);
      throw new BadRequestException(e);
    }
  }

  @ApiOperation({ summary: 'User authorization' })
  @Post('/login')
  async login() {
    try {
      // ...
    } catch (e) {
      throw new HttpException(
        'Failed to create a new user: such user already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ summary: 'Logging out of the system' })
  @Post('/logout')
  async loguot() {}
}
