import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;

  private BUCKET_NAME = this.configService.getOrThrow('AWS_BUCKET_NAME');
  private AWS_REGION = this.configService.getOrThrow('AWS_REGION');

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.AWS_REGION,
    });
  }

  async uploadSingleFile(file: Express.Multer.File): Promise<any> {
    const key = `${uuidv4()}`;
    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    });

    try {
      await this.s3Client.send(command);

      const fileUrl = `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}`;
      this.logger.log(`File uploaded (url: ${fileUrl})`);

      return {
        url: fileUrl,
        key,
      };
    } catch (e) {
      if (e.$metadata?.httpStatusCode === 403) {
        throw new ForbiddenException(
          'Access Denied: You do not have permission to upload files to this bucket.',
        );
      }
      throw e;
    }
  }

  async getFileUrl(key: string) {
    try {
      await this.checkFileExisting(key);
      return { url: `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}` };
    } catch (e) {
      if (e.$metadata?.httpStatusCode === 403) {
        throw new ForbiddenException(
          'Access Denied: You do not have permission to upload files to this bucket.',
        );
      }
      throw e;
    }
  }

  async deleteFile(key: string): Promise<any> {
    const command = new DeleteObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    });

    try {
      await this.checkFileExisting(key);
      return await this.s3Client.send(command);
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  public async checkFileExisting(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (e) {
      if (e.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException('File not found');
      }
      throw e;
    }
  }
}
