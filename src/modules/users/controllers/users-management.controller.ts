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
import { ChangeBlockRecordDateDto } from '../dto/change-block-record-date.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { RemoveRoleDto } from '../dto/remove-role.dto';
import { ChangeUserEmailDto } from '../dto/change-user-email.dto';

@ApiTags('users-management')
@Controller('/users/management')
export class UsersManagementController {
  constructor(
    private readonly usersManagementService: UsersManagementService,
  ) {}

  // --- User's email ---

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
  @Patch('/confirm-user-email')
  async confirmUserEmail(@Body() dto: ChangeUserEmailDto) {
    try {
      await this.usersManagementService.updateEmailConfirmationStatus(
        dto.newEmail,
        true,
      );
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
  @Patch('/unconfirm-user-email')
  async unconfirmUserEmail(@Body() dto: ChangeUserEmailDto) {
    try {
      await this.usersManagementService.updateEmailConfirmationStatus(
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

  @ApiOperation({ summary: 'Get all block records by userId' })
  @ApiResponse({
    status: 200,
    description: 'Block records retrieved',
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
          `Failed to get all block records by user ID. ${e}`,
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

  @ApiOperation({ summary: 'Get all active block records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all active block records',
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
  @Get('/get-all-active-block-records')
  async getAllActiveBlockRecords() {
    try {
      const blockRecords =
        await this.usersManagementService.getAllActiveBlockRecords();
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all active block records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all expired block records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all expired block records',
    type: [UserBlockEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Expired block records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-expired-block-records')
  async getAllExpiredBlockRecords() {
    try {
      const blockRecords =
        await this.usersManagementService.getAllExpiredBlockRecords();
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all expired block records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all active expired block records' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all active expired block records',
    type: [UserBlockEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Active expired block records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-active-expired-block-records')
  async getAllActiveExpiredBlockRecords() {
    try {
      const blockRecords =
        await this.usersManagementService.getAllActiveExpiredBlockRecords();
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all active expired block records. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all active block records by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all active block records',
    type: [UserBlockEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Active block records not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-active-block-records-by-userId/:id')
  async getAllActiveBlockRecordsByUserId(@Param('id') userId: number) {
    try {
      const blockRecords =
        await this.usersManagementService.getAllActiveBlockRecords(
          Number(userId),
        );
      return { amount: blockRecords.length, blockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get user all active blocks. ${e}`,
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

  @ApiOperation({ summary: 'Change unblock date' })
  @ApiResponse({
    status: 200,
    description: 'Unblock date changed',
  })
  @ApiResponse({
    status: 404,
    description: 'Block record not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'The new unblock date cannot be the same as the current unblock date',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Patch('/change-unblock-date')
  async changeUnblockDate(@Body() dto: ChangeBlockRecordDateDto) {
    try {
      await this.usersManagementService.changeUnblockDate(
        dto.blockRecordId,
        dto.date,
      );
      return {
        blockRecordId: dto.blockRecordId,
        newDate: dto.date,
        message: 'Unblock date successfully changed',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change unblock date. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete block record' })
  @ApiResponse({
    status: 200,
    description: 'Block record deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Block record not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Delete('/delete-block-record/:id')
  async deleteBlockRecord(@Param('id') id: number) {
    try {
      await this.usersManagementService.deleteBlockRecord(id);
      return {
        recordId: id,
        message: 'Block record successfully deleted',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete block record. ${e}`,
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

  @ApiOperation({ summary: 'Get all unblock records by userId' })
  @ApiResponse({
    status: 200,
    description: 'Unblock records retrieved',
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
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @Get('/get-all-unblock-records-by-userId/:id')
  async getAllUnblockRecordsByUserId(@Param('id') id: number) {
    try {
      const unblockRecords =
        await this.usersManagementService.getAllUnblockRecords(Number(id));
      return { amount: unblockRecords.length, unblockRecords };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all unblock records by user ID. ${e}`,
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
      const unblockRecords =
        await this.usersManagementService.getAllUnblockRecords();
      return { amount: unblockRecords.length, unblockRecords };
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

  // --- User's roles ---

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
    description: 'Role already assigned',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @HttpCode(200)
  @Post('/assign-role')
  async assignRoleToUser(@Body() dto: AssignRoleDto) {
    try {
      return await this.usersManagementService.assignRoleToUser(
        dto.userId,
        dto.roleId,
      );
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
      return await this.usersManagementService.removeRoleFromUser(
        dto.userId,
        dto.roleId,
      );
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
