import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { EmailValidationPipe } from 'src/common/pipes/validate-email.pipe';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';
import { UserUpdateDto } from './dto/user-update.dto';
import { HttpErrorFilter } from 'src/common/filters/http-error.filter';
import { UserBlockDto } from './dto/user-block.dto';

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
  @UseFilters(new HttpErrorFilter(true))
  @Post('/create')
  async createUser(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.createNewUser(dto);
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

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Wrong updating value format / New updating value for must be different from the current value ',
  })
  @ApiResponse({
    status: 404,
    description: 'User with such id does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'User with such email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @UseFilters(new HttpErrorFilter(true))
  @Put('/update/:id')
  async updateUser(
    @Param('id', new idValidationPipe()) id: number,
    @Body() dto: UserUpdateDto,
  ) {
    try {
      if (dto.username) {
        return await this.usersService.updateUserName(Number(id), dto);
      }
      if (dto.email) {
        return await this.usersService.updateUserEmail(Number(id), dto);
      }
      if (dto.password) {
        return await this.usersService.updateUserPassword(Number(id), dto);
      }
      throw new BadRequestException('Cannot update this user field');
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @HttpCode(200)
  @UsePipes(new idValidationPipe())
  @UseFilters(new HttpErrorFilter(true))
  @Delete('/delete/:id')
  async deleteUser(@Param('id') id: number) {
    try {
      await this.usersService.deleteUser(Number(id));
      return { userId: id, message: 'User deleted' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- Should add ---

  @ApiOperation({ summary: 'Block user' })
  @ApiResponse({
    status: 200,
    description: 'User blocked',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User is already blocked',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @UseFilters(new HttpErrorFilter(true))
  @Post('/block')
  async blockUser(@Body() dto: UserBlockDto) {
    try {
      await this.usersService.blockUser(Number(dto.userId));
      return { userId: dto.userId, message: 'User blocked' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to block the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Unblock user' })
  @ApiResponse({
    status: 200,
    description: 'User unblocked',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'This user is not blocked',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @UsePipes(new idValidationPipe())
  @UseFilters(new HttpErrorFilter(true))
  @Post('/unblock/:id')
  async unblockUser(@Param('id') id: number) {
    try {
      await this.usersService.unblockUser(Number(id));
      return { id, message: 'User unblocked' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to unblock the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // -----------------

  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({
    status: 200,
    description: 'User found and returned',
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
  @UseFilters(new HttpErrorFilter(true))
  @Get('/get-by-email')
  async getUserByEmail(@Query('email') email: string) {
    try {
      return await this.usersService.getUserByEmail(email);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find user by email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'User found and returned',
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
  @UseFilters(new HttpErrorFilter(true))
  @Get('/get-by-id/:id')
  async getUserById(@Param('id') id: number) {
    try {
      return await this.usersService.getUserById(id);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find user by id. ${e}`,
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
    status: 404,
    description: 'There are no users',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UseFilters(new HttpErrorFilter(true))
  @Get('/get-all')
  async getAllUsers() {
    try {
      const usersArray = await this.usersService.getAllUsers();
      return { usersAmount: usersArray.length, usersArray };
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

  @ApiOperation({ summary: 'Get all blocked users' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  @Get('/get-all-blocked')
  async getAllBlockedUsers() {
    try {
      // ..
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
