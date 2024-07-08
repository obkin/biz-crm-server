import {
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
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import { HttpErrorFilter } from 'src/common/http-error.filter';
import { UpdateRoleDto } from './dto/update-role.dto';
import { idValidationPipe } from 'src/pipes/validate-id.pipe';

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

  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated',
    type: RoleEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Such role not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UseFilters(new HttpErrorFilter(true))
  @Put('/update/:id')
  async updateRole(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
    try {
      return await this.rolesService.updateRole(id, dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to update the role. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: 200,
    description: 'Role deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the role' })
  @HttpCode(200)
  @UsePipes(new idValidationPipe())
  @UseFilters(new HttpErrorFilter(true))
  @Delete('/delete/:id')
  async deleteRole(@Param('id') id: number) {
    try {
      await this.rolesService.deleteRole(Number(id));
      return { id, message: 'Role deleted' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the role. ${e}`,
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
  @UseFilters(new HttpErrorFilter(true))
  @Get('/get-all-roles')
  async getAllRoles() {
    try {
      const rolesArray = await this.rolesService.getAllRoles();
      return { rolesAmount: rolesArray.length, rolesArray };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find all the roles. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
