import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersManagementService } from '../services/users-management.service';
import { UserDeletionEntity } from '../entities/user-deletion.entity';
import { UserBlockEntity } from '../entities/user-block.entity';

@ApiTags('users-management')
@Controller('/users/management')
export class UsersManagementController {
  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

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
  @Get('/get-block-record-by-userId/:id')
  async getBlockRecordByUserId(@Param('id') id: number) {
    try {
      return await this.usersManagementService.getBlockRecordByUserId(
        Number(id),
      );
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
      return await this.usersManagementService.getAllBlockRecords();
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
