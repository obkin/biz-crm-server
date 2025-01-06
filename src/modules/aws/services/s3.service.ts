import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName = this.configService.get('S3_REGION');

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.getOrThrow('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
      region: this.configService.getOrThrow('S3_REGION'),
      forcePathStyle: true,
    });
  }

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

      await this.s3Client.send(command);

      return {
        url: isPublic
          ? (await this.getFileUrl(key)).url
          : (await this.getPresignedSignedUrl(key)).url,
        key,
        isPublic,
      };
    } catch (e) {
      throw e;
    }
  }

  async getFileUrl(key: string) {
    try {
      return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
    } catch (e) {
      throw e;
    }
  }

  async getPresignedSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (e) {
      throw e;
    }
  }
}
