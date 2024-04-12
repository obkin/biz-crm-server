import {
  Body,
  ConflictException,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './models/user.model';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Creating a new user' })
  @ApiResponse({ status: 201, type: User })
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.register(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(
          `Failed to create new user. User with such email already exists`,
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException(
          `Failed to create new user`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'User authorization' })
  @Post('/login')
  async login() {
    // this method should create inside of 'auth' module
  }

  @ApiOperation({ summary: 'Logging out of the system' })
  @Post('/logout')
  async loguot() {
    // this method should create inside of 'auth' module
  }
}
