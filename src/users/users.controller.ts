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
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ValidateEmailPipe } from 'src/pipes/validate-email.pipe';
import { ValidateIdPipe } from 'src/pipes/validate-id.pipe';
import { UserEntity } from 'src/entities/user.entity';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: UserEntity })
  @Post('/create')
  async createUser(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.create(dto);
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

  @ApiOperation({ summary: 'Return existing user (by email)' })
  @ApiResponse({ status: 200, type: UserEntity })
  @UsePipes(new ValidateEmailPipe())
  @Get('/get-by-email')
  async getUserByEmail(@Query('email') email: string) {
    try {
      return await this.usersService.findByEmail(email);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find user by email: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Return existing user (by id)' })
  @ApiResponse({ status: 200, type: UserEntity })
  @UsePipes(new ValidateIdPipe())
  @Get('/get-by-id')
  async getUserById(@Query('id') id: number) {
    try {
      return await this.usersService.findById(id);
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to find user by id: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Return all existing users' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  @Get('/get-all')
  async getAllUsers() {
    try {
      return await this.usersService.getAllUsers();
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          `Failed to get all users: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Return all blocked users' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  @Get('/get-all-blocked')
  async getAllBlockedUsers() {
    try {
      // ..
    } catch (e) {
      // ..
    }
  }
}
