import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { UserRegisterDto } from '../../auth/dto/user-register.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { EmailValidationPipe } from 'src/common/pipes/validate-email.pipe';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';
import { ChangeUserNameDto } from '../dto/change-user-name.dto';
import { ChangeUserEmailDto } from '../dto/change-user-email.dto';
import { ChangeUserPasswordDto } from '../dto/change-user-password.dto';
import { UserNameValidationPipe } from 'src/common/pipes/validate-user-name.pipe';
import { Request } from 'express';

@ApiTags('users')
// @UseGuards(RolesGuard)
// @Roles('admin')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'New user created',
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
  @UsePipes(new UserNameValidationPipe())
  @Post('/create-user')
  async createUser(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.createUser(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change user name' })
  @ApiResponse({
    status: 200,
    description: 'User name changed',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Enter a new name',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UsePipes(new UserNameValidationPipe())
  @Put('/change-name')
  async changeUserName(@Body() dto: ChangeUserNameDto, @Req() req: Request) {
    try {
      return await this.usersService.changeUserName(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change user name. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change user email' })
  @ApiResponse({
    status: 200,
    description: 'User email changed',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Enter a new email',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with such email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Put('/change-email')
  async changeUserEmail(@Body() dto: ChangeUserEmailDto, @Req() req: Request) {
    try {
      return await this.usersService.changeUserEmail(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change user email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'User password changed',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Enter a new password',
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong old password',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Put('/change-password')
  async changeUserPassword(
    @Body() dto: ChangeUserPasswordDto,
    @Req() req: Request,
  ) {
    try {
      return await this.usersService.changeUserPassword(
        Number(req.user.id),
        dto,
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change user password. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user by email',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong email format',
  })
  @ApiResponse({
    status: 404,
    description: 'User with such email not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UsePipes(new EmailValidationPipe())
  @Get('/get-by-email')
  async getUserByEmail(@Query('email') email: string) {
    try {
      return await this.usersService.getUserByEmail(email);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get user by email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user by id',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 404,
    description: 'User with such id not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @UsePipes(new idValidationPipe())
  @Get('/get-by-id/:id')
  async getUserById(@Param('id') id: number) {
    try {
      return await this.usersService.getUserById(id);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get user by id. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all users',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all')
  async getAllUsers() {
    try {
      const users = await this.usersService.getAllUsers();
      return { amount: users.length, users };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all users. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all admins',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-admins')
  async getAllAdmins() {
    try {
      const admins = await this.usersService.getAllAdmins();
      return { amount: admins.length, admins };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all admins. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all blocked users' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all blocked users',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-blocked')
  async getAllBlockedUsers() {
    try {
      const blockedUsers = await this.usersService.getAllBlockedUsers();
      return { amount: blockedUsers.length, blockedUsers };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all blocked users. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
