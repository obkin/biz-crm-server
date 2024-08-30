import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersManagementService } from '../services/users-management.service';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserBlockEntity } from '../entities/user-block.entity';
import { UserDeleteDto } from '../dto/user-delete.dto';
import { UserEntity } from '../entities/user.entity';
import { Request } from 'express';
import { UserBlockDto } from '../dto/user-block.dto';
import { UserUnblockDto } from '../dto/user-unblock.dto';
import { UserUnblockEntity } from '../entities/user-unblock.entity';
import { ChangeBlockRecordStatusDto } from '../dto/change-block-record-status.dto';

@ApiTags('users-management')
@Controller('/users/management')
export class UsersManagementController {
  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  // --- User's blocking ---

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
  @Post('/block-user')
  async blockUser(@Body() dto: UserBlockDto, @Req() req: Request) {
    try {
      const admin: UserEntity = req.user;
      await this.usersManagementService.blockUser(admin, dto);
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

  @ApiOperation({ summary: 'Get block record by userId' })
  @ApiResponse({
    status: 200,
    description: 'Block record retrieved',
    type: UserBlockEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Block record not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @Get('/get-all-block-records-by-userId/:id')
  async getAllBlockRecordsByUserId(@Param('id') id: number) {
    try {
      const blockRecords = await this.usersManagementService.getAllBlockRecords(
        Number(id),
      );
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get block record by user ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all block records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all block records',
    type: [UserBlockEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Block records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-block-records')
  async getAllBlockRecords() {
    try {
      const blockRecords =
        await this.usersManagementService.getAllBlockRecords();
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all block records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // === User's blocking - debug ===

  @ApiOperation({ summary: 'Get block record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Block record retrieved ',
    type: UserBlockEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Block record not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-block-record-by-id/:id')
  async getBlockRecordById(@Param('id') blockRecordId: number) {
    try {
      return await this.usersManagementService.getBlockRecordById(
        Number(blockRecordId),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get block record by ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change block record status' })
  @ApiResponse({
    status: 200,
    description: 'Block record status changed',
  })
  @ApiResponse({
    status: 404,
    description: 'Block record not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Block record status is already changed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Patch('/change-block-record-status')
  async changeBlockRecordStatus(@Body() dto: ChangeBlockRecordStatusDto) {
    try {
      await this.usersManagementService.changeBlockRecordStatus(
        dto.blockRecordId,
        dto.isActive,
      );
      return {
        blockRecordId: dto.blockRecordId,
        newStatus: dto.isActive,
        message: 'Status successfully changed',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update block record status. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- User's unblocking ---

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
  @Post('/unblock-user')
  async unblockUser(@Body() dto: UserUnblockDto, @Req() req: Request) {
    try {
      const admin: UserEntity = req.user;
      await this.usersManagementService.unblockUser(admin, dto);
      return { userId: dto.userId, message: 'User unblocked' };
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

  @ApiOperation({ summary: 'Get unblock record by userId' })
  @ApiResponse({
    status: 200,
    description: 'Unblock record retrieved',
    type: UserUnblockEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Unblock record not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @Get('/get-unblock-record-by-userId/:id')
  async getUnblockRecordByUserId(@Param('id') id: number) {
    try {
      return await this.usersManagementService.getUnblockRecordByUserId(
        Number(id),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get unblock record by user ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all unblock records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all unblock records',
    type: [UserUnblockEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Unblock records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-unblock-records')
  async getAllUnblockRecords() {
    try {
      return await this.usersManagementService.getAllUnblockRecords();
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all unblock records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- User's delition ---

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
    status: 409,
    description: 'This user is admin',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Delete('/delete-user')
  async deleteUser(@Body() dto: UserDeleteDto, @Req() req: Request) {
    try {
      const admin: UserEntity = req.user;
      await this.usersManagementService.deleteUser(admin, dto);
      return {
        userId: dto.userId,
        message: 'User deleted',
      };
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

  @ApiOperation({ summary: 'Get deletion record by userId' })
  @ApiResponse({
    status: 200,
    description: 'Deletion record retrieved',
    type: UserDeletionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Deletion record not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @Get('/get-deletion-record-by-userId/:id')
  async getDelitionRecordByUserId(@Param('id') id: number) {
    try {
      return await this.usersManagementService.getDelitionRecordByUserId(
        Number(id),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get deletion record by user ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all deletion records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all deletion records',
    type: [UserDeletionEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Deletion records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-deletion-records')
  async getAllDeletionRecords() {
    try {
      return await this.usersManagementService.getAllDeletionRecords();
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all deletion records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
