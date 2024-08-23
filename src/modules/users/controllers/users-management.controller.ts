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

@ApiTags('users-management')
@Controller('/users/management')
export class UsersManagementController {
  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  @ApiOperation({ summary: 'Get deletion record by userId' })
  @ApiResponse({
    status: 200,
    description: 'Deletion record retrieved',
    type: UserDeletionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Deletion record with such ID not found',
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
          `Failed to get deletion record by ID. ${e}`,
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
