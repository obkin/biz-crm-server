import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailDto } from './dto/email.dto';
import { EmailCodeGenerator } from 'utils/email-code-generator';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly emailCodeGenerator: EmailCodeGenerator,
  ) {}

  // --- Service logic ---
  async sendConfirmationCode(dto: EmailDto): Promise<string> {
    try {
      const confirmationCode =
        this.emailCodeGenerator.generateConfirmationCode();

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

      return confirmationCode;
    } catch (e) {
      throw e;
    }
  }

  verifyConfirmationCode(enteredCode: string, generatedCode: string): boolean {
    return enteredCode === generatedCode;
  }
}
