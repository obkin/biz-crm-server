import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucketName = this.configService.get('S3_REGION');

  constructor(private readonly configService: ConfigService) {
    const s3Config = this.getS3Config();
    this.validateS3Config(s3Config);

    this.client = new S3Client({
      credentials: {
        accessKeyId: s3Config.S3_ACCESS_KEY,
        secretAccessKey: s3Config.S3_SECRET_ACCESS_KEY,
      },
      region: s3Config.S3_REGION,
      forcePathStyle: true,
    });
  }

  // --- Main Logic ---

  async uploadSingleFile({
    file,
    isPublic = true,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
  }) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: isPublic ? 'public-read' : 'private',

        Metadata: {
          originalName: file.originalname,
        },
      });

      await this.client.send(command);

      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getFileUrl(key)).url,
        key,
        isPublic,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  // --- Methods ---

  private getS3Config() {
    return {
      S3_ACCESS_KEY: this.configService.get('S3_ACCESS_KEY'),
      S3_SECRET_ACCESS_KEY: this.configService.get('S3_SECRET_ACCESS_KEY'),
      S3_REGION: this.configService.get('S3_REGION'),
      S3_BUCKET_NAME: this.configService.get('S3_BUCKET_NAME'),
      S3_ACL: this.configService.get('S3_ACL'),
    };
  }

  private validateS3Config(config: Record<string, string>) {
    const missingKeys = Object.keys(config).filter((key) => !config[key]);

    if (missingKeys.length > 0) {
      throw new InternalServerErrorException(
        `Missing configuration values for: ${missingKeys.join(', ')}`,
      );
    }
  }
}
