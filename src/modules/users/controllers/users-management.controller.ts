import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersManagementService } from '../services/users-management.service';

@ApiTags('users-management')
@Controller('/users/management')
export class UsersManagementController {
  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  @Get('/get-all-deletion-records')
  async getAllDeletionRecords() {
    try {
      return await this.usersManagementService.getAllDeletionRecords();
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed get all deletion records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
