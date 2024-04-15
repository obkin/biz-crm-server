import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { ValidateEmailPipe } from 'src/pipes/validate-email.pipe';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: User })
  @Post('/create')
  async createUser(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.create(dto);
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

  @ApiOperation({ summary: 'Return exists user (by email)' })
  @ApiResponse({ status: 200, type: User })
  @Get('/get-by-email')
  @UsePipes(new ValidateEmailPipe())
  async getUserByEmail(@Query('email') email: string) {
    try {
      return await this.usersService.findByEmail(email);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find user by email`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Return a user (by id)' })
  @ApiResponse({ status: 200, type: User })
  @Get('/get-by-id')
  async getUserById() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }

  @ApiOperation({ summary: 'Return all existing users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get('/get-all')
  async getAllUsers() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }

  @ApiOperation({ summary: 'Return all blocked users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get('/get-all-blocked')
  async getAllBlockedUsers() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }
}
