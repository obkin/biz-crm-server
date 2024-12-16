import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { FolderEntity } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { Request } from 'express';
import { idValidationPipe } from 'src/common/pipes/validate-id.pipe';

@ApiTags('folders')
@Controller('/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @ApiOperation({ summary: 'Create new folder' })
  @ApiResponse({
    status: 201,
    description: 'New folder created',
    type: FolderEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  async create(
    @Body() dto: CreateFolderDto,
    @Req() req: Request,
  ): Promise<FolderEntity> {
    try {
      return await this.foldersService.createFolder(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new folder. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all folders' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all folders',
    type: [FolderEntity],
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get()
  async findAll(@Req() req: Request, @Query('userId') ownerId?: number) {
    try {
      const folders = await this.foldersService.findAllFolders(
        Number(req.user.id),
        Number(ownerId),
      );
      return { amount: folders.length, folders };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find all folders. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved folder by id',
    type: FolderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 403,
    description: 'No access',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the folder' })
  @Get(':id')
  async findOne(
    @Param('id', idValidationPipe) folderId: number,
    @Req() req: Request,
  ): Promise<FolderEntity> {
    try {
      return await this.foldersService.findOneFolder(
        Number(req.user.id),
        Number(folderId),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to find the folder by ID. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async update() {}
  async remove() {}
}
