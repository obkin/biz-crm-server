import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
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
import { Request } from 'express';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { RemoveRoleDto } from '../dto/remove-role.dto';
import { UserNameValidationPipe } from 'src/common/pipes/validate-user-name.pipe';

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

  @ApiOperation({ summary: 'Confirm user email' })
  @ApiResponse({
    status: 200,
    description: 'User email confirmed',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User email is already confirmed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Patch('/confirm-email')
  async confirmUserEmail(@Body() dto: ChangeUserEmailDto) {
    try {
      await this.usersService.updateEmailConfirmationStatus(dto.newEmail, true);
      return {
        userEmail: dto.newEmail,
        message: 'User email confirmed successfully',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to confirm user email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Unconfirm user email' })
  @ApiResponse({
    status: 200,
    description: 'User email unconfirmed',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User email is already unconfirmed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Patch('/unconfirm-email')
  async unconfirmUserEmail(@Body() dto: ChangeUserEmailDto) {
    try {
      await this.usersService.updateEmailConfirmationStatus(
        dto.newEmail,
        false,
      );
      return {
        userEmail: dto.newEmail,
        message: 'User email unconfirmed successfully',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to unconfirm user email. ${e}`,
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
    status: 404,
    description: 'There are no blocked users',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-blocked')
  async getAllBlockedUsers() {
    try {
      const blockedUsersArray = await this.usersService.getAllBlockedUsers();
      return {
        blockedUsersAmount: blockedUsersArray.length,
        blockedUsersArray,
      };
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

  // --- Roles ---
  @ApiOperation({ summary: 'Assign role to the user' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Role already assigned to user',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Post('/assign-role')
  async assignRoleToUser(@Body() dto: AssignRoleDto) {
    try {
      return await this.usersService.assignRoleToUser(dto.userId, dto.roleId);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to assign the role to the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Remove role from the user' })
  @ApiResponse({
    status: 200,
    description: 'Role removed',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove the <user> role',
  })
  @ApiResponse({
    status: 409,
    description: 'User does not have this role',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Post('/remove-role')
  async removeRoleFromUser(@Body() dto: RemoveRoleDto) {
    try {
      return await this.usersService.removeRoleFromUser(dto.userId, dto.roleId);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to remove the role from the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
