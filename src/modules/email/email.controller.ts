import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendConfirmationCodeDto } from './dto/send-confirmation-code.dto';
import { VerifyConfirmationCodeDto } from './dto/verify-confirmation-code.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@Controller('/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @HttpCode(200)
  @Post('/send-code')
  async sendCode(@Body() dto: SendConfirmationCodeDto) {
    try {
      const generatedCode = await this.emailService.sendConfirmationCode(dto);
      return {
        code: generatedCode,
        message: 'Confirmation code sent successfully',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to send confirmation code. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @HttpCode(200)
  @Post('/verify-code')
  async verifyConfirmationCode(@Body() dto: VerifyConfirmationCodeDto) {
    try {
      return await this.emailService.verifyConfirmationCode(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to verify confirmation code. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
