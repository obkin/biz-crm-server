import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { S3Service } from '../services/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE } from '../aws.constants';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('s3')
@Controller('/aws/s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/file')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE,
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return this.s3Service.uploadSingleFile(file);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to upload file. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/file')
  async getFileUrl(@Query('key') key: string) {
    try {
      return this.s3Service.getFileUrl(key);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get the file. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete('/file')
  async deleteFile(@Query('key') key: string) {
    try {
      await this.s3Service.deleteFile(key);
      return {
        key,
        message: 'File deleted',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the file. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
