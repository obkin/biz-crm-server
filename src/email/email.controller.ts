import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendConfirmationCodeDto } from './dto/send-confirmation-code.dto';

@Controller('/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @HttpCode(200)
  @Post('/send-code')
  async sendConfirmCode(@Body() dto: SendConfirmationCodeDto) {
    try {
      await this.emailService.sendConfirmationCode(dto);
      return { message: 'Confirmation code sent successfully' };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw new HttpException(`${e.message}`, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          `Failed to send confirmation code: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
