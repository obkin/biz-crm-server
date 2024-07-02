import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import { HttpErrorFilter } from 'src/common/http-error.filter';

@ApiTags('roles')
@Controller('/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({
    status: 201,
    description: 'New role created',
    type: RoleEntity,
  })
  @ApiResponse({
    status: 409,
    description: 'Such role already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UseFilters(new HttpErrorFilter(true))
  @Post('/create')
  async createRole(@Body() dto: CreateRoleDto) {
    try {
      return await this.rolesService.createNewRole(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new role. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all roles',
    type: [RoleEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'There are no roles',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all-roles')
  @UseFilters(new HttpErrorFilter(true))
  async getAllRoles() {
    try {
      return await this.rolesService.getAllRoles();
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find all refresh tokens. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
