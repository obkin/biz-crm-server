import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailCodeGenerator } from 'utils/email-code-generator';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { VerifyConfirmationCodeDto } from './dto/verify-confirmation-code.dto';
import { SendConfirmationCodeDto } from './dto/send-confirmation-code.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly emailCodeGenerator: EmailCodeGenerator,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // --- Service logic ---
  async sendConfirmationCode(dto: SendConfirmationCodeDto): Promise<string> {
    try {
      const redisClient = this.redisService.getClient();
      const confirmationCode =
        this.emailCodeGenerator.generateConfirmationCode();

      await redisClient.set(
        `confirmation_code:${dto.email}`,
        confirmationCode,
        'EX',
        Number(
          this.configService.get<number>('REDIS_EMAIL_CONFIRMATION_CODE_LIFE'),
        ),
      );

      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'BizCRM Confirmation Code',
        template: 'confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="text-align: center; color: #333;">Email Confirmation</h2>
            <p style="text-align: center;">Please use the following confirmation code to verify your email address:</p>
            <p style="text-align: center; font-size: 24px; font-weight: bold;">${confirmationCode}</p>
            <p style="text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
        context: {
          code: confirmationCode,
        },
      });

      this.logger.log(`Confirmation code sent to user (email: ${dto.email})`);
      return confirmationCode;
    } catch (e) {
      throw e;
    }
  }

  async verifyConfirmationCode(
    dto: VerifyConfirmationCodeDto,
  ): Promise<boolean> {
    try {
      const storedCode = await this.redisService.get(
        `confirmation_code:${dto.email}`,
      );
      if (!storedCode) {
        throw new BadRequestException(
          'Confirmation code has expired or does not exist',
        );
      }
      if (storedCode !== dto.code) {
        throw new BadRequestException('Invalid confirmation code');
      }

      await this.redisService.del(`confirmation_code:${dto.email}`);
      this.logger.log(
        `Confirmation code verified and deleted (email: ${dto.email})`,
      );
      return true;
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---
  private generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
